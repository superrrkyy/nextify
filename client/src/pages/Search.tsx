import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchAPI, genresAPI } from '../services/api';
import { Track, Artist, Album, Playlist, Genre } from '../types';
import { TrackRow } from '../components/music/TrackRow';
import { MusicCard } from '../components/music/MusicCard';
import { debounce } from '../lib/utils';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState<{ tracks: Track[]; artists: Artist[]; albums: Album[]; playlists: Playlist[] }>({
    tracks: [],
    artists: [],
    albums: [],
    playlists: [],
  });
  const [activeTab, setActiveTab] = useState<'all' | 'tracks' | 'artists' | 'albums' | 'playlists'>('all');
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const navigate = useNavigate();

  const debouncedSearch = debounce(async (q: string) => {
    if (!q.trim()) {
      setResults({ tracks: [], artists: [], albums: [], playlists: [] });
      return;
    }
    setLoading(true);
    try {
      const { data } = await searchAPI.search(q, 'all', 20);
      if (data.success) {
        setResults({
          tracks: data.data.tracks || [],
          artists: data.data.artists || [],
          albums: data.data.albums || [],
          playlists: data.data.playlists || [],
        });
      }
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    setInputValue(query);
    if (query) {
      debouncedSearch(query);
    } else {
      setResults({ tracks: [], artists: [], albums: [], playlists: [] });
    }
  }, [query]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [historyRes, genresRes] = await Promise.all([
          searchAPI.history().catch(() => ({ data: { data: [] } })),
          genresAPI.list(),
        ]);
        setRecentSearches(historyRes.data.data || []);
        setGenres(genresRes.data.data || []);
      } catch {}
    };
    fetchMeta();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  const clearHistory = async () => {
    try {
      await searchAPI.clearHistory();
      setRecentSearches([]);
    } catch {}
  };

  const hasResults = results.tracks.length > 0 || results.artists.length > 0 || results.albums.length > 0 || results.playlists.length > 0;

  return (
    <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative max-w-2xl">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-lg">⌕</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search for songs, artists, albums and playlists"
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary border border-border/50 text-text placeholder:text-muted focus:outline-none focus:border-accent/50 focus:bg-surface transition-all text-base"
            autoFocus
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                setSearchParams({});
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted hover:text-text"
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {!query ? (
        <div className="space-y-10">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text">Recent searches</h2>
                <button onClick={clearHistory} className="text-xs text-muted hover:text-text">Clear all</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.slice(0, 8).map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => setSearchParams({ q: item.query })}
                    className="px-4 py-2 rounded-full bg-secondary border border-border/50 text-sm text-text hover:border-accent/30 transition-colors"
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Browse categories */}
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Browse categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: 'Trending Now', color: 'from-red-500 to-orange-500', query: 'trending' },
                { name: 'Viral Hits', color: 'from-pink-500 to-rose-500', query: 'viral' },
                { name: '80s Essentials', color: 'from-violet-500 to-purple-500', query: '80s' },
                { name: '90s Throwback', color: 'from-blue-500 to-cyan-500', query: '90s' },
                { name: '2000s Replay', color: 'from-emerald-500 to-teal-500', query: '2000s' },
                { name: 'Chill Nights', color: 'from-indigo-500 to-blue-500', query: 'chill' },
                { name: 'Focus Flow', color: 'from-amber-500 to-orange-500', query: 'focus' },
                { name: 'Workout Energy', color: 'from-red-500 to-pink-500', query: 'workout' },
              ].map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSearchParams({ q: cat.query })}
                  className={`h-24 rounded-2xl bg-gradient-to-br ${cat.color} p-4 text-left hover:scale-[1.02] transition-transform`}
                >
                  <span className="font-bold text-white">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSearchParams({ q: genre.slug })}
                  className="px-4 py-2 rounded-full bg-secondary border border-border/50 text-sm text-muted hover:text-text hover:border-accent/50 transition-all"
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center text-3xl">♪</div>
            <h3 className="font-medium text-text mb-1">Search for songs, artists, albums and playlists</h3>
            <p className="text-sm text-muted">Find your next favorite track</p>
          </div>
        </div>
      ) : (
        <div>
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-8 border-b border-border/30 pb-2 overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'tracks', label: 'Songs' },
              { id: 'artists', label: 'Artists' },
              { id: 'albums', label: 'Albums' },
              { id: 'playlists', label: 'Playlists' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? 'bg-accent text-background' : 'bg-secondary text-muted hover:text-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : !hasResults ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-medium text-text">No results for "{query}"</h3>
              <p className="text-sm text-muted mt-1">Try different keywords or check spelling</p>
            </div>
          ) : (
            <div className="space-y-10">
              {(activeTab === 'all' || activeTab === 'tracks') && results.tracks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text mb-4">Songs</h3>
                  <div className="rounded-2xl bg-secondary border border-border/30 overflow-hidden">
                    {results.tracks.map((track, idx) => (
                      <TrackRow key={track.id} track={track} index={idx} queue={results.tracks} showIndex />
                    ))}
                  </div>
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text mb-4">Artists</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {results.artists.map((artist) => (
                      <div
                        key={artist.id}
                        onClick={() => navigate(`/artist/${artist.id}`)}
                        className="p-4 rounded-2xl bg-secondary border border-border/30 hover:bg-surface hover:border-border/50 cursor-pointer transition-colors text-center"
                      >
                        <img src={artist.avatarUrl} alt={artist.name} className="w-24 h-24 rounded-full mx-auto mb-3 object-cover" />
                        <div className="font-medium text-text truncate">{artist.name}</div>
                        <div className="text-xs text-muted">Artist</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'albums') && results.albums.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text mb-4">Albums</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {results.albums.map((album) => (
                      <MusicCard key={album.id} album={album} onClick={() => navigate(`/album/${album.id}`)} />
                    ))}
                  </div>
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'playlists') && results.playlists.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text mb-4">Playlists</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {results.playlists.map((playlist) => (
                      <MusicCard key={playlist.id} playlist={playlist} onClick={() => navigate(`/playlist/${playlist.id}`)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
