import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { playlistsAPI, likesAPI, historyAPI, userAPI, tracksAPI } from '../services/api';
import { Playlist, Track } from '../types';
import { TrackRow } from '../components/music/TrackRow';
import { MusicCard } from '../components/music/MusicCard';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { useAudio } from '../context/AudioContext';

export function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'playlists';
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { setQueue } = useAudio();

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'playlists' || !tab) {
        const { data } = await playlistsAPI.list();
        if (data.success) setPlaylists(data.data);
      } else if (tab === 'liked') {
        const { data } = await likesAPI.list();
        if (data.success) setLikedTracks(data.data);
      } else if (tab === 'history') {
        const { data } = await historyAPI.list(50);
        if (data.success) setHistory(data.data);
      } else if (tab === 'downloads') {
        const { data } = await userAPI.downloads();
        if (data.success) setDownloads(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      const { data } = await playlistsAPI.create({
        name: newPlaylistName.trim(),
        description: newPlaylistDesc.trim(),
        isPublic: false,
      });
      if (data.success) {
        setPlaylists([data.data, ...playlists]);
        setShowCreateModal(false);
        setNewPlaylistName('');
        setNewPlaylistDesc('');
        success('Playlist created');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create playlist');
    }
  };

  const tabs = [
    { id: 'playlists', label: 'Playlists' },
    { id: 'liked', label: 'Liked Songs' },
    { id: 'history', label: 'Recently Played' },
    { id: 'downloads', label: 'Downloads' },
    { id: 'artists', label: 'Artists' },
    { id: 'albums', label: 'Albums' },
  ];

  return (
    <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Your Library</h1>
        {tab === 'playlists' && (
          <Button onClick={() => setShowCreateModal(true)}>+ New Playlist</Button>
        )}
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSearchParams({ tab: t.id })}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-accent text-background' : 'bg-secondary text-muted hover:text-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {tab === 'playlists' && (
            <div>
              {playlists.length === 0 ? (
                <div className="text-center py-16 rounded-2xl bg-secondary border border-border/30">
                  <div className="text-4xl mb-3">📁</div>
                  <h3 className="font-medium text-text">No playlists yet</h3>
                  <p className="text-sm text-muted mt-1 mb-4">Create your first playlist to get started</p>
                  <Button onClick={() => setShowCreateModal(true)}>Create playlist</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {playlists.map((pl) => (
                    <MusicCard key={pl.id} playlist={pl} onClick={() => navigate(`/playlist/${pl.id}`)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'liked' && (
            <div>
              {likedTracks.length === 0 ? (
                <div className="text-center py-16 rounded-2xl bg-secondary border border-border/30">
                  <div className="text-4xl mb-3">♥</div>
                  <h3 className="font-medium text-text">No liked songs</h3>
                  <p className="text-sm text-muted mt-1">Like songs to see them here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-secondary/20 border border-accent/20">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-2xl">♥</div>
                    <div>
                      <h2 className="text-2xl font-bold">Liked Songs</h2>
                      <p className="text-sm text-muted">{likedTracks.length} songs</p>
                    </div>
                    <Button className="ml-auto" onClick={() => setQueue(likedTracks, 0)}>Play all</Button>
                  </div>
                  <div className="rounded-2xl bg-secondary border border-border/30 overflow-hidden">
                    {likedTracks.map((track, idx) => (
                      <TrackRow key={track.id} track={track} index={idx} queue={likedTracks} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'history' && (
            <div>
              {history.length === 0 ? (
                <div className="text-center py-16 rounded-2xl bg-secondary border border-border/30">
                  <h3 className="font-medium text-text">No listening history</h3>
                  <p className="text-sm text-muted mt-1">Play some tracks to see your history</p>
                </div>
              ) : (
                <div className="rounded-2xl bg-secondary border border-border/30 overflow-hidden">
                  {history.map((h: any, idx: number) => (
                    <TrackRow key={`${h.track.id}-${idx}`} track={h.track} index={idx} queue={history.map((x: any) => x.track)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'downloads' && (
            <div>
              {downloads.length === 0 ? (
                <div className="text-center py-16 rounded-2xl bg-secondary border border-border/30">
                  <h3 className="font-medium text-text">No downloads</h3>
                  <p className="text-sm text-muted mt-1">Download tracks where allowed to listen offline</p>
                  <p className="text-xs text-muted mt-2">Only tracks marked as downloadable can be downloaded (legal requirement)</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {downloads.map((d: any) => (
                    <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border/30">
                      <img src={d.track.coverUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="font-medium text-text">{d.track.title}</div>
                        <div className="text-xs text-muted">{d.track.artist.name}</div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">Downloaded</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(tab === 'artists' || tab === 'albums') && (
            <div className="text-center py-16 rounded-2xl bg-secondary border border-border/30">
              <h3 className="font-medium text-text">Coming soon</h3>
              <p className="text-sm text-muted mt-1">Follow artists and save albums to see them here</p>
            </div>
          )}
        </>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border/50 shadow-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Create playlist</h2>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text mb-1 block">Name</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My awesome playlist"
                  className="w-full h-11 px-4 rounded-xl bg-secondary border border-border/50 text-text focus:outline-none focus:border-accent/50"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text mb-1 block">Description (optional)</label>
                <textarea
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="What's this playlist about?"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border/50 text-text focus:outline-none focus:border-accent/50 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
