import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  BookPlus,
  BookCheck,
  Shield,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/books', label: 'Books', icon: BookOpen },
  { to: '/issue-book', label: 'Issue Book', icon: BookPlus },
  { to: '/return-book', label: 'Return Book', icon: BookCheck },
];

const adminItems = [
  { to: '/admin', label: 'Admin Panel', icon: Shield },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const allItems = isAdmin ? [...navItems, ...adminItems] : navItems;

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
      isActive
        ? 'bg-violet-500/20 text-violet-400 border-l-2 border-violet-500'
        : 'text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📚</span>
          <span className="text-xl font-bold gradient-text">LibraryMS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {allItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={linkClasses}
            onClick={onClose}
          >
            <item.icon size={20} className="shrink-0" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info Card */}
      <div className="px-4 pb-6">
        <div className="glass p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name || 'User'}
            </p>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full bg-violet-500/20 text-violet-400">
              {user?.role || 'member'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 glass border-r border-white/10 rounded-none flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Sidebar Panel */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 glass rounded-none border-r border-white/10 animate-slide-in-left flex flex-col z-10 bg-[#0f0a1a]/95">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
