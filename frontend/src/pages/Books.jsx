import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Loader2, BookOpen, Pencil, Trash2, BookPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { bookService } from '../services/bookService'
import { issueService } from '../services/issueService'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import Modal from '../components/Modal'

export default function Books() {
  const { isAdmin } = useAuth()
  const [books, setBooks] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(null)

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: '', quantity: '' })

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true)
      let res
      if (searchKeyword.trim()) {
        res = await bookService.searchBooks(searchKeyword.trim(), page, 9)
      } else {
        res = await bookService.getBooks(page, 9, 'title', 'asc')
      }
      const data = res.data.data
      setBooks(data.content || [])
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

  // Debounced search
  useEffect(() => {
    setPage(0)
  }, [searchKeyword])

  const handleIssue = async (bookId, title) => {
    try {
      setIssuing(bookId)
      await issueService.issueBook(bookId)
      toast.success(`"${title}" issued successfully!`)
      fetchBooks()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to issue book'
      toast.error(msg)
    } finally {
      setIssuing(null)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setFormLoading(true)
      await bookService.addBook({ ...form, quantity: parseInt(form.quantity) })
      toast.success('Book added successfully!')
      setShowAddModal(false)
      setForm({ title: '', author: '', isbn: '', category: '', quantity: '' })
      fetchBooks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add book')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      setFormLoading(true)
      await bookService.updateBook(selectedBook.id, { ...form, quantity: parseInt(form.quantity) })
      toast.success('Book updated successfully!')
      setShowEditModal(false)
      fetchBooks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update book')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setFormLoading(true)
      await bookService.deleteBook(selectedBook.id)
      toast.success('Book deleted successfully!')
      setShowDeleteModal(false)
      fetchBooks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book')
    } finally {
      setFormLoading(false)
    }
  }

  const openEdit = (book) => {
    setSelectedBook(book)
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category || '',
      quantity: book.quantity.toString(),
    })
    setShowEditModal(true)
  }

  const openDelete = (book) => {
    setSelectedBook(book)
    setShowDeleteModal(true)
  }

  const BookForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-white/60 mb-1">Title</label>
        <input
          type="text" required value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input-glass" placeholder="Book title"
        />
      </div>
      <div>
        <label className="block text-sm text-white/60 mb-1">Author</label>
        <input
          type="text" required value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          className="input-glass" placeholder="Author name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1">ISBN</label>
          <input
            type="text" required value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
            className="input-glass" placeholder="ISBN"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Category</label>
          <input
            type="text" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-glass" placeholder="Category"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-white/60 mb-1">Quantity</label>
        <input
          type="number" required min="0" value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          className="input-glass" placeholder="Number of copies"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={formLoading} fullWidth>{submitLabel}</Button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Books</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="input-glass pl-10"
            />
          </div>
          {isAdmin && (
            <Button
              onClick={() => {
                setForm({ title: '', author: '', isbn: '', category: '', quantity: '' })
                setShowAddModal(true)
              }}
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Book
            </Button>
          )}
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : books.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <p className="text-white/40 text-lg">No books found</p>
            <p className="text-white/20 text-sm mt-1">
              {searchKeyword ? 'Try a different search term' : 'The library is empty'}
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {books.map((book, idx) => (
            <GlassCard key={book.id} hover className="flex flex-col" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{book.title}</h3>
                <p className="text-white/50 text-sm mb-3">{book.author}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {book.category && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300">
                      {book.category}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/40">
                    {book.isbn}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/40">Availability:</span>
                  <span className={book.availableQuantity > 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                    {book.availableQuantity}/{book.quantity}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                {book.availableQuantity > 0 && (
                  <Button
                    onClick={() => handleIssue(book.id, book.title)}
                    loading={issuing === book.id}
                    className="text-sm !py-2 !px-4"
                  >
                    <BookPlus className="w-4 h-4 mr-1" /> Issue
                  </Button>
                )}
                {isAdmin && (
                  <>
                    <Button variant="ghost" onClick={() => openEdit(book)} className="text-sm !py-2 !px-3">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="danger" onClick={() => openDelete(book)} className="text-sm !py-2 !px-3">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
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
          <span className="text-sm text-white/50">
            Page {page + 1} of {totalPages}
          </span>
          <Button variant="ghost" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
            Next
          </Button>
        </div>
      )}

      {/* Add Book Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Book">
        <BookForm onSubmit={handleAdd} submitLabel="Add Book" />
      </Modal>

      {/* Edit Book Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Book">
        <BookForm onSubmit={handleEdit} submitLabel="Update Book" />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete">
        <p className="text-white/60 mb-6">
          Are you sure you want to delete <span className="text-white font-semibold">"{selectedBook?.title}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)} fullWidth>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={formLoading} fullWidth>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
