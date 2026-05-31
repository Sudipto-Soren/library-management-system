import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, BookMarked, Library, Users, ArrowRight, BookPlus, BookCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { bookService } from '../services/bookService'
import { issueService } from '../services/issueService'
import { userService } from '../services/userService'
import GlassCard from '../components/GlassCard'
import StatsCard from '../components/StatsCard'

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

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalBooks: 0, activeIssues: 0, available: 0, extra: 0 })
  const [recentIssues, setRecentIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch books for stats
      const booksRes = await bookService.getBooks(0, 100)
      const booksData = booksRes.data.data
      const totalBooks = booksData.totalElements || 0
      const availableBooks = (booksData.content || []).reduce(
        (sum, b) => sum + (b.availableQuantity || 0), 0
      )

      // Fetch user's issues
      const issuesRes = await issueService.getMyIssues(0, 5)
      const issuesData = issuesRes.data.data
      const allIssues = issuesData.content || []
      const activeIssues = allIssues.filter(i => i.status === 'ISSUED').length

      // Fetch total active issues count (may be more than 5)
      const allIssuesRes = await issueService.getMyIssues(0, 100)
      const totalActiveIssues = (allIssuesRes.data.data.content || []).filter(
        i => i.status === 'ISSUED'
      ).length

      let extraStat = 0
      if (isAdmin) {
        try {
          const usersRes = await userService.getAllUsers(0, 1)
          extraStat = usersRes.data.data.totalElements || 0
        } catch { extraStat = 0 }
      } else {
        extraStat = (allIssuesRes.data.data.content || []).filter(
          i => i.status === 'ISSUED' && isOverdue(i.dueDate, i.status)
        ).length
      }

      setStats({ totalBooks, activeIssues: totalActiveIssues, available: availableBooks, extra: extraStat })
      setRecentIssues(allIssues.slice(0, 5))
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Browse Books',
      desc: 'Explore the library catalog',
      icon: BookOpen,
      path: '/books',
      color: 'from-violet-500 to-purple-600',
    },
    {
      title: 'Issue a Book',
      desc: 'Borrow a book from the library',
      icon: BookPlus,
      path: '/issue',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Return a Book',
      desc: 'Return your borrowed books',
      icon: BookCheck,
      path: '/returns',
      color: 'from-emerald-500 to-teal-600',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            {user?.name}
          </span>
          ! 👋
        </h1>
        <p className="text-white/50 mt-1">Here's what's happening in your library.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Books" value={stats.totalBooks} icon={BookOpen} color="violet" />
        <StatsCard title="My Active Issues" value={stats.activeIssues} icon={BookMarked} color="blue" />
        <StatsCard title="Available Copies" value={stats.available} icon={Library} color="emerald" />
        <StatsCard
          title={isAdmin ? 'Total Users' : 'Overdue Books'}
          value={stats.extra}
          icon={isAdmin ? Users : BookMarked}
          color="rose"
        />
      </div>

      {/* Recent Issues */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Issues</h2>
          <button
            onClick={() => navigate('/returns')}
            className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentIssues.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No books issued yet</p>
            <button
              onClick={() => navigate('/books')}
              className="text-violet-400 hover:text-violet-300 text-sm mt-2 transition-colors"
            >
              Browse the catalog →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 border-b border-white/10">
                  <th className="text-left py-3 px-2 font-medium">Book Title</th>
                  <th className="text-left py-3 px-2 font-medium">Issue Date</th>
                  <th className="text-left py-3 px-2 font-medium">Due Date</th>
                  <th className="text-left py-3 px-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentIssues.map((issue, idx) => (
                  <tr
                    key={issue.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className="py-3 px-2 font-medium">{issue.bookTitle}</td>
                    <td className="py-3 px-2 text-white/60">{formatDate(issue.issueDate)}</td>
                    <td className="py-3 px-2 text-white/60">{formatDate(issue.dueDate)}</td>
                    <td className="py-3 px-2">
                      {issue.status === 'RETURNED' ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                          Returned
                        </span>
                      ) : isOverdue(issue.dueDate, issue.status) ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                          Overdue
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400">
                          Issued
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => navigate(action.path)}
              className="glass glass-hover p-6 text-left transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">{action.title}</h3>
              <p className="text-sm text-white/40">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
