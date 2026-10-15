import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { searchAPI } from '../../services/api';
import { debounce } from '../../lib/utils';

export function Header() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const debouncedSearch = debounce(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const { data } = await searchAPI.search(q, 'all', 5);
      const results = data.data;
      const all: any[] = [
        ...(results.tracks || []).map((t: any) => ({ type: 'track', ...t })),
        ...(results.artists || []).map((a: any) => ({ type: 'artist', ...a })),
      ];
      setSuggestions(all.slice(0, 5));
    } catch (error) {
      console.error('Search error', error);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-2xl bg-background/80 border-b border-border/30">
      <div className="flex items-center gap-4 px-6 py-3">
        {/* Navigation arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-muted hover:text-text hover:border-border transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-muted hover:text-text hover:border-border transition-colors"
          >
            →
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-[400px] relative">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">⌕</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search songs, artists, albums..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary border border-border/50 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 focus:bg-surface transition-all"
            />
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full rounded-2xl bg-surface border border-border/50 shadow-2xl overflow-hidden z-50">
              {suggestions.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    if (item.type === 'track') navigate(`/`);
                    else if (item.type === 'artist') navigate(`/artist/${item.id}`);
                    setShowSuggestions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                    {item.coverUrl || item.avatarUrl ? (
                      <img src={item.coverUrl || item.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">♪</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text truncate">{item.title || item.name}</div>
                    <div className="text-xs text-muted truncate">{item.type} • {item.artist?.name || ''}</div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                  setShowSuggestions(false);
                }}
                className="w-full px-4 py-3 text-xs text-accent hover:bg-secondary border-t border-border/30 transition-colors"
              >
                See all results for "{query}"
              </button>
            </div>
          )}
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-secondary border border-border/50 hover:border-border transition-colors"
              >
                <img
                  src={user?.avatarUrl || `https://i.pravatar.cc/100?img=12`}
                  alt={user?.username}
                  className="w-7 h-7 rounded-full"
                />
                <span className="text-sm font-medium text-text hidden sm:block">{user?.username}</span>
                <span className="text-muted text-xs">▼</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-surface border border-border/50 shadow-2xl overflow-hidden z-50">
                  <div className="p-3 border-b border-border/30">
                    <div className="text-sm font-medium text-text">{user?.username}</div>
                    <div className="text-xs text-muted truncate">{user?.email}</div>
                  </div>
                  <div className="p-2 space-y-1">
                    <button onClick={() => { navigate('/profile'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm text-text hover:bg-secondary transition-colors">Profile</button>
                    <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm text-text hover:bg-secondary transition-colors">Settings</button>
                    {user?.role === 'ADMIN' && (
                      <button onClick={() => { navigate('/admin'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm text-accent hover:bg-secondary transition-colors">Admin Dashboard</button>
                    )}
                    <div className="border-t border-border/30 my-1" />
                    <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">Log out</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="hidden sm:flex px-4 py-2 rounded-full text-sm font-medium text-muted hover:text-text transition-colors">
                Log in
              </button>
              <button onClick={() => navigate('/register')} className="px-5 py-2 rounded-full bg-accent text-background text-sm font-semibold hover:bg-accent-secondary transition-colors">
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
