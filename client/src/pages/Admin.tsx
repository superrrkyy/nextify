import { useEffect, useState } from 'react';
import { adminAPI, tracksAPI, artistsAPI, genresAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export function Admin() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTrack, setShowCreateTrack] = useState(false);
  const [newTrack, setNewTrack] = useState({
    title: '',
    artistId: '',
    duration: 180,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: '',
    downloadAllowed: false,
  });
  const [artists, setArtists] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const { success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, tracksRes, artistsRes, genresRes] = await Promise.all([
        adminAPI.stats(),
        adminAPI.users(),
        tracksAPI.list({ limit: 50 }),
        artistsAPI.list(50),
        genresAPI.list(),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (tracksRes.data.success) setTracks(tracksRes.data.data);
      if (artistsRes.data.success) setArtists(artistsRes.data.data);
      if (genresRes.data.success) setGenres(genresRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await tracksAPI.list(); // dummy to keep api
      // Actually create via direct api call
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(newTrack),
      });
      const result = await response.json();
      if (result.success) {
        success('Track created');
        setShowCreateTrack(false);
        fetchData();
      } else {
        error(result.message || 'Failed');
      }
    } catch (err: any) {
      error('Failed to create track');
    }
  };

  if (loading) {
    return <div className="p-10"><div className="h-64 bg-secondary animate-pulse rounded-2xl" /></div>;
  }

  return (
    <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8" style={{ fontFamily: 'Space Grotesk' }}>Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Users', value: stats?.users },
          { label: 'Tracks', value: stats?.tracks },
          { label: 'Artists', value: stats?.artists },
          { label: 'Albums', value: stats?.albums },
          { label: 'Playlists', value: stats?.playlists },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-2xl bg-secondary border border-border/30">
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Tracks */}
        <div className="rounded-2xl bg-secondary border border-border/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Tracks ({tracks.length})</h3>
            <Button size="sm" onClick={() => setShowCreateTrack(true)}>+ Add Track</Button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {tracks.map((track: any) => (
              <div key={track.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors">
                <img src={track.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{track.title}</div>
                  <div className="text-xs text-muted truncate">{track.artist?.name}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${track.downloadAllowed ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-surface border border-border/50 text-muted'}`}>
                  {track.downloadAllowed ? 'DL OK' : 'No DL'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Users */}
        <div className="rounded-2xl bg-secondary border border-border/30 p-6">
          <h3 className="font-semibold mb-4">Users ({users.length})</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {users.map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                  {u.username[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.username}</div>
                  <div className="text-xs text-muted truncate">{u.email}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-accent text-background' : 'bg-surface border border-border/50 text-muted'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legal note */}
      <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200">
        <strong>Copyright compliance:</strong> Only upload tracks where you have legal authorization. Mark downloadAllowed only for tracks where downloading is legally permitted. Never expose private storage credentials. This demo uses SoundHelix sample MP3s for development.
      </div>

      {/* Create Track Modal */}
      {showCreateTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowCreateTrack(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border/50 shadow-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Add Track (Admin)</h2>
            <form onSubmit={handleCreateTrack} className="space-y-4">
              <input value={newTrack.title} onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })} placeholder="Title" className="w-full h-11 px-4 rounded-xl bg-secondary border border-border/50 text-text" required />
              <select value={newTrack.artistId} onChange={(e) => setNewTrack({ ...newTrack, artistId: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-secondary border border-border/50 text-text" required>
                <option value="">Select artist</option>
                {artists.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <input type="number" value={newTrack.duration} onChange={(e) => setNewTrack({ ...newTrack, duration: parseInt(e.target.value) })} placeholder="Duration (seconds)" className="w-full h-11 px-4 rounded-xl bg-secondary border border-border/50 text-text" />
              <input value={newTrack.audioUrl} onChange={(e) => setNewTrack({ ...newTrack, audioUrl: e.target.value })} placeholder="Audio URL" className="w-full h-11 px-4 rounded-xl bg-secondary border border-border/50 text-text" required />
              <input value={newTrack.coverUrl} onChange={(e) => setNewTrack({ ...newTrack, coverUrl: e.target.value })} placeholder="Cover URL (optional)" className="w-full h-11 px-4 rounded-xl bg-secondary border border-border/50 text-text" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={newTrack.downloadAllowed} onChange={(e) => setNewTrack({ ...newTrack, downloadAllowed: e.target.checked })} />
                Download allowed (only if legally authorized)
              </label>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowCreateTrack(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
