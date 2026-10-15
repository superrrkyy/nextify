import { NavLink } from 'react-router-dom';

const items = [
  { path: '/', label: 'Home', icon: '⌂' },
  { path: '/search', label: 'Search', icon: '⌕' },
  { path: '/library', label: 'Library', icon: '♡' },
  { path: '/profile', label: 'Profile', icon: '◐' },
];

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-secondary/90 backdrop-blur-2xl border-t border-border/50 px-2 py-2 safe-area-bottom">
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive ? 'text-accent bg-accent/10' : 'text-muted'
              }`
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
