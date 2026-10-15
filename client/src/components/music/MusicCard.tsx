import { motion } from 'framer-motion';
import { Track, Playlist, Artist, Album } from '../../types';
import { useAudio } from '../../context/AudioContext';
import { formatNumber } from '../../lib/utils';

interface MusicCardProps {
  track?: Track;
  playlist?: Playlist;
  artist?: Artist;
  album?: Album;
  onClick?: () => void;
}

export function MusicCard({ track, playlist, artist, album, onClick }: MusicCardProps) {
  const { currentTrack, isPlaying, play } = useAudio();

  const item = track || playlist || artist || album;
  if (!item) return null;

  const isCurrentTrack = track && currentTrack?.id === track.id;
  const coverUrl = (track?.coverUrl || (playlist as any)?.coverImage || artist?.avatarUrl || album?.coverUrl || `https://picsum.photos/300/300?random=${item.id.slice(-3)}`);
  const title = track?.title || (playlist as any)?.name || artist?.name || album?.title || '';
  const subtitle = track ? track.artist.name : playlist ? `${(playlist as any)._count?.tracks || 0} songs` : artist ? `${formatNumber(artist.monthlyListeners)} listeners` : (album as any)?.artist?.name || '';

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (track) {
      play(track);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative p-3 rounded-2xl bg-surface/30 hover:bg-surface/60 border border-transparent hover:border-border/50 backdrop-blur-sm transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary mb-3">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlay}
          className={`
            absolute bottom-3 right-3 w-12 h-12 rounded-full bg-accent text-background 
            flex items-center justify-center shadow-xl shadow-accent/20 
            transition-all duration-300
            ${track ? 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0' : 'opacity-0 group-hover:opacity-100'}
            ${isCurrentTrack ? '!opacity-100 !translate-y-0' : ''}
          `}
        >
          {isCurrentTrack && isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          )}
        </motion.button>

        {isCurrentTrack && isPlaying && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-accent text-background text-[10px] font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-background animate-pulse" />
            PLAYING
          </div>
        )}

        {track?.downloadAllowed && (
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-sm text-text truncate group-hover:text-accent transition-colors">{title}</h3>
        <p className="text-xs text-muted truncate">{subtitle}</p>
      </div>
    </motion.div>
  );
}

export function TrackCardGrid({ tracks, onTrackClick }: { tracks: Track[]; onTrackClick?: (track: Track) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {tracks.map((track) => (
        <MusicCard key={track.id} track={track} onClick={() => onTrackClick?.(track)} />
      ))}
    </div>
  );
}
