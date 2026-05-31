import { useState, useEffect, useCallback } from 'react'
import { Search, BookPlus, Loader2, BookOpen, CalendarDays, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { bookService } from '../services/bookService'
import { issueService } from '../services/issueService'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import Modal from '../components/Modal'

export default function IssueBook() {
  const [books, setBooks] = useState([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(null)
  const [confirmBook, setConfirmBook] = useState(null)

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true)
      let res
      if (searchKeyword.trim()) {
        res = await bookService.searchBooks(searchKeyword.trim(), page, 8)
      } else {
        res = await bookService.getBooks(page, 8, 'title', 'asc')
      }
      const data = res.data.data
      setBooks((data.content || []).filter(b => b.availableQuantity > 0))
      setTotalPages(data.totalPages || 0)
    } catch (err) {
      toast.error('Failed to load books')
    } finally {
      setLoading(false)
    }
  }, [page, searchKeyword])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  useEffect(() => {
    setPage(0)
  }, [searchKeyword])

  const handleIssue = async () => {
    if (!confirmBook) return
    try {
      setIssuing(confirmBook.id)
      await issueService.issueBook(confirmBook.id)
      toast.success(`"${confirmBook.title}" issued successfully!`)
      setConfirmBook(null)
      fetchBooks()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to issue book'
      toast.error(msg)
    } finally {
      setIssuing(null)
    }
  }

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 14)
  const dueDateStr = dueDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Issue a Book</h1>
        <p className="text-white/50 mt-1">Search and borrow books from the library.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="input-glass pl-12 text-lg"
        />
      </div>

      {/* Books */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : books.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <p className="text-white/40 text-lg">No available books found</p>
            <p className="text-white/20 text-sm mt-1">
              {searchKeyword ? 'Try a different search term' : 'All books are currently issued'}
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map((book, idx) => (
            <GlassCard key={book.id} hover className="flex items-center justify-between gap-4" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{book.title}</h3>
                <p className="text-white/50 text-sm">{book.author}</p>
                <div className="flex items-center gap-3 mt-2">
                  {book.category && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300">
                      {book.category}
                    </span>
                  )}
                  <span className="text-xs text-white/30">{book.isbn}</span>
                </div>
                <p className="text-sm text-emerald-400 mt-2 font-medium">
                  {book.availableQuantity} {book.availableQuantity === 1 ? 'copy' : 'copies'} available
                </p>
              </div>
              <Button onClick={() => setConfirmBook(book)} className="shrink-0">
                <BookPlus className="w-4 h-4 mr-2" /> Issue
              </Button>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
            Previous
          </Button>
          <span className="text-sm text-white/50">Page {page + 1} of {totalPages}</span>
          <Button variant="ghost" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
            Next
          </Button>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal isOpen={!!confirmBook} onClose={() => setConfirmBook(null)} title="Confirm Book Issue">
        {confirmBook && (
          <div className="space-y-4">
            <div className="glass p-4 rounded-xl">
              <h3 className="font-semibold text-white text-lg">{confirmBook.title}</h3>
              <p className="text-white/50">{confirmBook.author}</p>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <CalendarDays className="w-5 h-5 text-violet-400" />
              <div>
                <p className="text-white/40">Due Date</p>
                <p className="text-white font-medium">{dueDateStr}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm text-white/40 glass p-3 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p>You can borrow this book for 14 days. Please return it before the due date to avoid penalties.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setConfirmBook(null)} fullWidth>Cancel</Button>
              <Button onClick={handleIssue} loading={issuing === confirmBook.id} fullWidth>
                Confirm Issue
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
