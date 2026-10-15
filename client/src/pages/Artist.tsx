import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { artistsAPI } from '../services/api';
import { Artist as ArtistType } from '../types';
import { TrackRow } from '../components/music/TrackRow';
import { Button } from '../components/ui/Button';
import { useAudio } from '../context/AudioContext';
import { formatNumber } from '../lib/utils';

export function Artist() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ArtistType | null>(null);
  const [loading, setLoading] = useState(true);
  const { setQueue } = useAudio();

  useEffect(() => {
    if (id) {
      artistsAPI.get(id).then(({ data }) => {
        if (data.success) setArtist(data.data);
      }).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-10"><div className="h-64 bg-secondary animate-pulse rounded-2xl" /></div>;
  if (!artist) return <div className="p-10 text-center">Artist not found</div>;

  return (
    <div className="min-h-screen">
      <div className="relative h-[340px] overflow-hidden">
        <img src={artist.coverUrl || artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex items-end gap-6">
            <img src={artist.avatarUrl} alt={artist.name} className="w-28 h-28 rounded-full border-4 border-background shadow-2xl object-cover hidden md:block" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-accent text-background text-[10px] font-bold">VERIFIED ARTIST</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>{artist.name}</h1>
              <p className="text-muted mt-2">{formatNumber(artist.monthlyListeners)} monthly listeners</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button size="lg" className="rounded-full w-14 h-14 p-0" onClick={() => artist.tracks && setQueue(artist.tracks, 0)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><path d="M8 5.14v14l11-7-11-7z" /></svg>
          </Button>
          <Button variant="secondary">Follow</Button>
          <button className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-muted">⋯</button>
        </div>

        {artist.tracks && artist.tracks.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">Popular</h2>
            <div className="rounded-2xl bg-secondary border border-border/30 overflow-hidden">
              {artist.tracks.map((track, idx) => (
                <TrackRow key={track.id} track={track} index={idx} queue={artist.tracks!} />
              ))}
            </div>
          </div>
        )}

        {artist.albums && artist.albums.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Albums</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {artist.albums.map((album) => (
                <div key={album.id} className="p-3 rounded-2xl bg-secondary border border-border/30">
                  <img src={album.coverUrl} alt={album.title} className="aspect-square rounded-xl object-cover mb-3" />
                  <div className="font-medium text-sm truncate">{album.title}</div>
                  <div className="text-xs text-muted">{new Date(album.releaseDate || '').getFullYear()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Album() {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { setQueue } = useAudio();

  useEffect(() => {
    if (id) {
      fetch(`${import.meta.env.VITE_API_URL}/albums/${id}`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setAlbum(d.data); })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-10"><div className="h-64 bg-secondary animate-pulse rounded-2xl" /></div>;
  if (!album) return <div className="p-10 text-center">Album not found</div>;

  return (
    <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <img src={album.coverUrl} alt={album.title} className="w-56 h-56 rounded-2xl object-cover shadow-2xl" />
        <div className="flex flex-col justify-end">
          <div className="text-xs font-bold tracking-widest uppercase text-muted mb-2">Album</div>
          <h1 className="text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: 'Space Grotesk' }}>{album.title}</h1>
          <p className="text-muted">{album.artist?.name} • {album.tracks?.length} songs • {new Date(album.releaseDate).getFullYear()}</p>
          <div className="flex gap-3 mt-6">
            <Button size="lg" className="rounded-full w-14 h-14 p-0" onClick={() => setQueue(album.tracks, 0)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><path d="M8 5.14v14l11-7-11-7z" /></svg>
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-secondary border border-border/30 overflow-hidden">
        {album.tracks?.map((track: any, idx: number) => (
          <TrackRow key={track.id} track={track} index={idx} queue={album.tracks} />
        ))}
      </div>
    </div>
  );
}
