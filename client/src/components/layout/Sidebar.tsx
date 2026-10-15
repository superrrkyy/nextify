import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/', label: 'Home', icon: '⌂' },
  { path: '/search', label: 'Search', icon: '⌕' },
  { path: '/library', label: 'Your Library', icon: '♡' },
];

const libraryItems = [
  { path: '/library?tab=playlists', label: 'Playlists', icon: '≡' },
  { path: '/library?tab=liked', label: 'Liked Songs', icon: '♥' },
  { path: '/library?tab=albums', label: 'Albums', icon: '◍' },
  { path: '/library?tab=artists', label: 'Artists', icon: '◐' },
  { path: '/library?tab=history', label: 'Recently Played', icon: '↻' },
  { path: '/library?tab=downloads', label: 'Downloads', icon: '↓' },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-[280px] h-screen sticky top-0 p-3 gap-3 bg-background">
      {/* Logo */}
      <div className="rounded-2xl bg-secondary border border-border/50 p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center font-bold text-background text-lg">
            N
          </div>
          <div>
            <div className="font-bold text-text tracking-tight text-lg leading-none" style={{ fontFamily: 'Space Grotesk' }}>NEXTIFY</div>
            <div className="text-[10px] text-muted tracking-widest uppercase">Your Sound Era</div>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-surface text-text' : 'text-muted hover:text-text hover:bg-surface/50'
                }`
              }
            >
              <span className="text-lg w-6 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Library */}
      <div className="flex-1 rounded-2xl bg-secondary border border-border/50 p-5 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-text">Your Library</h2>
          <button className="w-7 h-7 rounded-full bg-surface border border-border/50 flex items-center justify-center text-muted hover:text-text transition-colors">
            <span className="text-lg leading-none">+</span>
          </button>
        </div>

        <div className="space-y-1 overflow-y-auto scrollbar-thin">
          {libraryItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive ? 'bg-surface text-text' : 'text-muted hover:text-text hover:bg-surface/50'
                }`
              }
            >
              <span className="w-6 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Create playlist card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="mt-6 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent-secondary/10 border border-accent/20"
        >
          <h3 className="text-sm font-medium text-text mb-1">Create your first playlist</h3>
          <p className="text-xs text-muted mb-3">It's easy, we'll help you</p>
          <button className="px-4 py-2 rounded-full bg-accent text-background text-xs font-semibold hover:bg-accent-secondary transition-colors">
            Create playlist
          </button>
        </motion.div>

        {/* User */}
        {user && (
          <div className="mt-auto pt-4 border-t border-border/50 flex items-center gap-3">
            <img src={user.avatarUrl || `https://i.pravatar.cc/100?img=${user.id.slice(-2)}`} alt={user.username} className="w-8 h-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text truncate">{user.username}</div>
              <div className="text-xs text-muted truncate">{user.email}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
