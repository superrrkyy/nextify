import { motion } from 'framer-motion';
import { Track } from '../../types';
import { formatDuration, cn } from '../../lib/utils';
import { useAudio } from '../../context/AudioContext';
import { useState } from 'react';

interface TrackRowProps {
  track: Track;
  index?: number;
  queue?: Track[];
  showIndex?: boolean;
  showAlbum?: boolean;
  onMore?: (track: Track) => void;
}

export function TrackRow({ track, index, queue, showIndex = true, showAlbum = false, onMore }: TrackRowProps) {
  const { currentTrack, isPlaying, play, queue: audioQueue } = useAudio();
  const isCurrent = currentTrack?.id === track.id;
  const [isHovered, setIsHovered] = useState(false);

  const handlePlay = () => {
    if (queue) {
      play(track, queue);
    } else {
      play(track);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer',
        'hover:bg-surface/80 border border-transparent hover:border-border/50',
        isCurrent ? 'bg-surface border-border/50' : ''
      )}
      onClick={handlePlay}
    >
      {/* Index / Play */}
      <div className="w-8 flex items-center justify-center text-sm">
        {showIndex && (
          <>
            {isHovered || isCurrent ? (
              <button className="w-8 h-8 rounded-full bg-accent text-background flex items-center justify-center">
                {isCurrent && isPlaying ? (
                  <span className="flex gap-0.5">
                    <span className="w-0.5 h-3 bg-background animate-[wave_0.8s_ease-in-out_infinite]" />
                    <span className="w-0.5 h-3 bg-background animate-[wave_0.8s_ease-in-out_0.2s_infinite]" />
                    <span className="w-0.5 h-3 bg-background animate-[wave_0.8s_ease-in-out_0.4s_infinite]" />
                  </span>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                )}
              </button>
            ) : (
              <span className="text-muted tabular-nums">{index !== undefined ? index + 1 : ''}</span>
            )}
          </>
        )}
      </div>

      {/* Cover */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface flex-shrink-0">
        {track.coverUrl ? (
          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent-secondary/20 flex items-center justify-center">
            <span className="text-accent text-lg">♪</span>
          </div>
        )}
        {isCurrent && isPlaying && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex gap-0.5">
              <span className="w-0.5 h-3 bg-accent animate-[wave_0.8s_ease-in-out_infinite]" />
              <span className="w-0.5 h-3 bg-accent animate-[wave_0.8s_ease-in-out_0.2s_infinite]" />
              <span className="w-0.5 h-3 bg-accent animate-[wave_0.8s_ease-in-out_0.4s_infinite]" />
            </div>
          </div>
        )}
      </div>

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <div className={cn('font-medium truncate text-sm', isCurrent ? 'text-accent' : 'text-text')}>
          {track.title}
          {track.isExplicit && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted/20 text-muted">E</span>
          )}
        </div>
        <div className="text-xs text-muted truncate">
          {track.artist.name}
          {showAlbum && track.album ? ` • ${track.album.title}` : ''}
        </div>
      </div>

      {/* Duration & Actions */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted tabular-nums hidden sm:block">{formatDuration(track.duration)}</span>
        
        {track.downloadAllowed && (
          <div className="w-2 h-2 rounded-full bg-accent/60 hidden md:block" title="Download available" />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onMore?.(track);
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-text hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
