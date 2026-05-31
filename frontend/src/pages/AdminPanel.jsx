import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, BookOpen, ClipboardList, Users, Plus, Pencil, Trash2, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { bookService } from '../services/bookService'
import { issueService } from '../services/issueService'
import { userService } from '../services/userService'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import Modal from '../components/Modal'

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const isOverdue = (dueDate, status) => {
  if (status !== 'ISSUED') return false
  return new Date(dueDate) < new Date()
}

const tabs = [
  { id: 'books', label: 'Manage Books', icon: BookOpen },
  { id: 'issues', label: 'All Issues', icon: ClipboardList },
  { id: 'users', label: 'Users', icon: Users },
]

export default function AdminPanel() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('books')

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96 animate-fade-in">
        <GlassCard className="text-center max-w-md">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400/50" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/50 mb-6">You don't have permission to access the admin panel.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go to Dashboard
          </Button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-violet-500/20 text-violet-300'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'books' && <BooksTab />}
      {activeTab === 'issues' && <IssuesTab />}
      {activeTab === 'users' && <UsersTab />}
    </div>
  )
}

/* ===== Books Tab ===== */
function BooksTab() {
  const [books, setBooks] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: '', quantity: '' })

  useEffect(() => { fetchBooks() }, [page])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const res = await bookService.getBooks(page, 10, 'id', 'desc')
      const data = res.data.data
      setBooks(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch { toast.error('Failed to load books') }
    finally { setLoading(false) }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setFormLoading(true)
      await bookService.addBook({ ...form, quantity: parseInt(form.quantity) })
      toast.success('Book added!')
      setShowAddModal(false)
      setForm({ title: '', author: '', isbn: '', category: '', quantity: '' })
      fetchBooks()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add') }
    finally { setFormLoading(false) }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      setFormLoading(true)
      await bookService.updateBook(selectedBook.id, { ...form, quantity: parseInt(form.quantity) })
      toast.success('Book updated!')
      setShowEditModal(false)
      fetchBooks()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update') }
    finally { setFormLoading(false) }
  }

  const handleDelete = async () => {
    try {
      setFormLoading(true)
      await bookService.deleteBook(selectedBook.id)
      toast.success('Book deleted!')
      setShowDeleteModal(false)
      fetchBooks()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete') }
    finally { setFormLoading(false) }
  }

  const BookForm = ({ onSubmit, label }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {[
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'author', label: 'Author', type: 'text', required: true },
        { key: 'isbn', label: 'ISBN', type: 'text', required: true },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'quantity', label: 'Quantity', type: 'number', required: true },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-sm text-white/60 mb-1">{f.label}</label>
          <input type={f.type} required={f.required} min={f.type === 'number' ? 0 : undefined}
            value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            className="input-glass" placeholder={f.label} />
        </div>
      ))}
      <Button type="submit" loading={formLoading} fullWidth>{label}</Button>
    </form>
  )

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-white/50 text-sm">{books.length} books on this page</p>
        <Button onClick={() => { setForm({ title: '', author: '', isbn: '', category: '', quantity: '' }); setShowAddModal(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Add Book
        </Button>
      </div>

      <GlassCard className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 border-b border-white/10 bg-white/[0.02]">
                {['ID','Title','Author','ISBN','Category','Qty','Available','Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white/50">{book.id}</td>
                  <td className="py-3 px-4 font-medium">{book.title}</td>
                  <td className="py-3 px-4 text-white/60">{book.author}</td>
                  <td className="py-3 px-4 text-white/40 text-xs">{book.isbn}</td>
                  <td className="py-3 px-4">
                    {book.category && <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300">{book.category}</span>}
                  </td>
                  <td className="py-3 px-4">{book.quantity}</td>
                  <td className="py-3 px-4">
                    <span className={book.availableQuantity > 0 ? 'text-emerald-400' : 'text-red-400'}>{book.availableQuantity}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedBook(book); setForm({ title: book.title, author: book.author, isbn: book.isbn, category: book.category || '', quantity: book.quantity.toString() }); setShowEditModal(true) }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => { setSelectedBook(book); setShowDeleteModal(true) }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
          <span className="text-sm text-white/50">Page {page + 1} of {totalPages}</span>
          <Button variant="ghost" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next</Button>
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Book">
        <BookForm onSubmit={handleAdd} label="Add Book" />
      </Modal>
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Book">
        <BookForm onSubmit={handleEdit} label="Update Book" />
      </Modal>
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete">
        <p className="text-white/60 mb-6">Delete <span className="text-white font-semibold">"{selectedBook?.title}"</span>? This can't be undone.</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)} fullWidth>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={formLoading} fullWidth>Delete</Button>
        </div>
      </Modal>
    </>
  )
}

/* ===== Issues Tab ===== */
function IssuesTab() {
  const [issues, setIssues] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchIssues() }, [page])

  const fetchIssues = async () => {
    try {
      setLoading(true)
      const res = await issueService.getAllIssues(page, 15)
      const data = res.data.data
      setIssues(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch { toast.error('Failed to load issues') }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>

  return (
    <>
      <GlassCard className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 border-b border-white/10 bg-white/[0.02]">
                {['ID','User','Book','Issue Date','Due Date','Return Date','Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => (
                <tr key={issue.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white/50">{issue.id}</td>
                  <td className="py-3 px-4 font-medium">{issue.userName}</td>
                  <td className="py-3 px-4">{issue.bookTitle}</td>
                  <td className="py-3 px-4 text-white/60">{formatDate(issue.issueDate)}</td>
                  <td className="py-3 px-4 text-white/60">{formatDate(issue.dueDate)}</td>
                  <td className="py-3 px-4 text-white/60">{formatDate(issue.returnDate)}</td>
                  <td className="py-3 px-4">
                    {issue.status === 'RETURNED' ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">Returned</span>
                    ) : isOverdue(issue.dueDate, issue.status) ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 flex items-center gap-1 w-fit">
                        <AlertCircle className="w-3 h-3" /> Overdue
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400">Issued</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {issues.length === 0 && (
        <div className="text-center py-12 text-white/40">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No issue records found</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
          <span className="text-sm text-white/50">Page {page + 1} of {totalPages}</span>
          <Button variant="ghost" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next</Button>
        </div>
      )}
    </>
  )
}

/* ===== Users Tab ===== */
function UsersTab() {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await userService.getAllUsers(page, 15)
      const data = res.data.data
      setUsers(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>

  return (
    <>
      <GlassCard className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 border-b border-white/10 bg-white/[0.02]">
                {['ID','Name','Email','Role','Joined'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white/50">{user.id}</td>
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-white/60">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-violet-500/20 text-violet-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/60">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {users.length === 0 && (
        <div className="text-center py-12 text-white/40">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No users found</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
          <span className="text-sm text-white/50">Page {page + 1} of {totalPages}</span>
          <Button variant="ghost" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next</Button>
        </div>
      )}
    </>
  )
}
