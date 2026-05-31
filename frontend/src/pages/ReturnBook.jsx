import { useState, useEffect } from 'react'
import { Loader2, BookCheck, BookOpen, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { issueService } from '../services/issueService'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import Modal from '../components/Modal'

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const isOverdue = (dueDate) => new Date(dueDate) < new Date()

export default function ReturnBook() {
  const navigate = useNavigate()
  const [issues, setIssues] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [returning, setReturning] = useState(null)
  const [confirmReturn, setConfirmReturn] = useState(null)

  useEffect(() => {
    fetchIssues()
  }, [page])

  const fetchIssues = async () => {
    try {
      setLoading(true)
      const res = await issueService.getMyIssues(page, 10)
      const data = res.data.data
      setIssues(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch (err) {
      toast.error('Failed to load issues')
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async () => {
    if (!confirmReturn) return
    try {
      setReturning(confirmReturn.id)
      await issueService.returnBook(confirmReturn.id)
      toast.success(`"${confirmReturn.bookTitle}" returned successfully!`)
      setConfirmReturn(null)
      fetchIssues()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book')
    } finally {
      setReturning(null)
    }
  }

  const activeIssues = issues.filter(i => i.status === 'ISSUED')
  const returnedIssues = issues.filter(i => i.status === 'RETURNED')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Return Books</h1>
        <p className="text-white/50 mt-1">Manage your borrowed books and returns.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : issues.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <p className="text-white/40 text-lg">No issued books</p>
            <p className="text-white/20 text-sm mt-1 mb-4">You haven't borrowed any books yet.</p>
            <Button onClick={() => navigate('/books')}>Browse Books</Button>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Active Issues Section */}
          {activeIssues.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                Currently Issued ({activeIssues.length})
              </h2>
              <div className="space-y-3">
                {activeIssues.map((issue, idx) => (
                  <GlassCard
                    key={issue.id}
                    hover
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{issue.bookTitle}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/50">
                        <span>Issued: {formatDate(issue.issueDate)}</span>
                        <span>Due: {formatDate(issue.dueDate)}</span>
                      </div>
                      {isOverdue(issue.dueDate) && (
                        <div className="flex items-center gap-1 mt-2 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">Overdue</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {isOverdue(issue.dueDate) ? (
                        <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-400 font-medium">
                          Overdue
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 font-medium">
                          Issued
                        </span>
                      )}
                      <Button onClick={() => setConfirmReturn(issue)} className="!py-2">
                        <BookCheck className="w-4 h-4 mr-2" /> Return
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Returned Issues Section */}
          {returnedIssues.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                Returned ({returnedIssues.length})
              </h2>
              <GlassCard>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-white/40 border-b border-white/10">
                        <th className="text-left py-3 px-2 font-medium">Book</th>
                        <th className="text-left py-3 px-2 font-medium">Issued</th>
                        <th className="text-left py-3 px-2 font-medium">Due</th>
                        <th className="text-left py-3 px-2 font-medium">Returned</th>
                        <th className="text-left py-3 px-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnedIssues.map((issue) => (
                        <tr key={issue.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-2 font-medium">{issue.bookTitle}</td>
                          <td className="py-3 px-2 text-white/60">{formatDate(issue.issueDate)}</td>
                          <td className="py-3 px-2 text-white/60">{formatDate(issue.dueDate)}</td>
                          <td className="py-3 px-2 text-white/60">{formatDate(issue.returnDate)}</td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                              Returned
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
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
        </>
      )}

      {/* Return Confirmation Modal */}
      <Modal isOpen={!!confirmReturn} onClose={() => setConfirmReturn(null)} title="Confirm Return">
        {confirmReturn && (
          <div className="space-y-4">
            <p className="text-white/60">
              Return <span className="text-white font-semibold">"{confirmReturn.bookTitle}"</span>?
            </p>
            {isOverdue(confirmReturn.dueDate) && (
              <div className="flex items-center gap-2 glass p-3 rounded-xl text-sm text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>This book is overdue. Please return it as soon as possible.</span>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setConfirmReturn(null)} fullWidth>Cancel</Button>
              <Button onClick={handleReturn} loading={returning === confirmReturn.id} fullWidth>
                Confirm Return
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
