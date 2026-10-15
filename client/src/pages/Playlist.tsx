import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { playlistsAPI } from '../services/api';
import { Playlist as PlaylistType, Track } from '../types';
import { TrackRow } from '../components/music/TrackRow';
import { Button } from '../components/ui/Button';
import { useAudio } from '../context/AudioContext';
import { useToast } from '../components/ui/Toast';
import { formatDuration } from '../lib/utils';

export function Playlist() {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const { setQueue, play } = useAudio();
  const { success, error } = useToast();

  useEffect(() => {
    if (id) fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const { data } = await playlistsAPI.get(id!);
      if (data.success) {
        setPlaylist(data.data);
        setEditName(data.data.name);
        setEditDesc(data.data.description || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (playlist?.tracks) {
      const tracks = playlist.tracks.map((pt) => pt.track);
      setQueue(tracks, 0);
    }
  };

  const handleShuffle = () => {
    if (playlist?.tracks) {
      const tracks = [...playlist.tracks.map((pt) => pt.track)];
      for (let i = tracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
      }
      setQueue(tracks, 0);
    }
  };

  const handleSave = async () => {
    if (!playlist) return;
    try {
      const { data } = await playlistsAPI.update(playlist.id, {
        name: editName,
        description: editDesc,
      });
      if (data.success) {
        setPlaylist(data.data);
        setIsEditing(false);
        success('Playlist updated');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!playlist) return;
    try {
      await playlistsAPI.removeTrack(playlist.id, trackId);
      setPlaylist({
        ...playlist,
        tracks: playlist.tracks?.filter((pt) => pt.trackId !== trackId),
      });
      success('Track removed');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to remove track');
    }
  };

  if (loading) {
    return (
      <div className="p-10">
        <div className="h-64 rounded-[24px] bg-secondary animate-pulse mb-8" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">Playlist not found</h2>
      </div>
    );
  }

  const tracks = playlist.tracks?.map((pt) => pt.track) || [];
  const totalDuration = tracks.reduce((acc, t) => acc + t.duration, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent-secondary/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

        <div className="relative px-6 md:px-10 py-10 flex flex-col md:flex-row gap-8 items-end">
          <div className="w-56 h-56 rounded-2xl bg-secondary border border-border/50 shadow-2xl overflow-hidden flex-shrink-0">
            {playlist.coverImage ? (
              <img src={playlist.coverImage} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent-secondary/20 flex items-center justify-center text-5xl">♪</div>
            )}
          </div>

          <div className="flex-1 min-w-0 pb-2">
            <div className="text-xs font-bold tracking-widest uppercase text-muted mb-2">Playlist</div>
            {isEditing ? (
              <div className="space-y-3 max-w-md">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-3xl font-bold bg-secondary border border-border/50 rounded-xl px-3 py-2 text-text"
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-secondary border border-border/50 rounded-xl px-3 py-2 text-sm text-text"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text mb-4" style={{ fontFamily: 'Space Grotesk' }}>
                  {playlist.name}
                </h1>
                {playlist.description && <p className="text-muted mb-3 max-w-2xl">{playlist.description}</p>}
                <div className="flex items-center gap-2 text-sm text-muted">
                  <span className="font-medium text-text">{playlist.owner?.username}</span>
                  <span>•</span>
                  <span>{tracks.length} songs</span>
                  <span>•</span>
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Button size="lg" onClick={handlePlayAll} className="w-14 h-14 rounded-full p-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><path d="M8 5.14v14l11-7-11-7z" /></svg>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShuffle} className="rounded-full border border-border/50">⇄</Button>
          <Button variant="ghost" size="icon" className="rounded-full border border-border/50">♡</Button>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-secondary border border-border/30">
            <div className="text-4xl mb-3">🎵</div>
            <h3 className="font-medium text-text">No tracks yet</h3>
            <p className="text-sm text-muted mt-1">Add songs to this playlist from search or browse</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-secondary border border-border/30 overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 text-xs font-medium text-muted uppercase tracking-widest border-b border-border/30">
              <span className="w-8">#</span>
              <span>Title</span>
              <span>Duration</span>
            </div>
            {playlist.tracks?.map((pt, idx) => (
              <div key={pt.id} className="group relative">
                <TrackRow track={pt.track} index={idx} queue={tracks} />
                <button
                  onClick={() => handleRemoveTrack(pt.trackId)}
                  className="absolute right-16 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
