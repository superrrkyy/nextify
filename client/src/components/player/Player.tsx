import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAudio } from '../../context/AudioContext';
import { formatDuration } from '../../lib/utils';

export function Player() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isShuffle,
    repeatMode,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    setQueueVisible,
  } = useAudio();
  
  const navigate = useNavigate();
  const [showVolume, setShowVolume] = useState(false);

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] h-[80px] bg-secondary/95 backdrop-blur-2xl border-t border-border/50 z-30 hidden lg:flex items-center justify-center">
        <div className="text-sm text-muted">No track selected • Choose a song to start listening</div>
      </div>
    );
  }

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  return (
    <>
      {/* Desktop Player */}
      <div className="hidden lg:flex fixed bottom-0 left-0 right-0 lg:left-[280px] h-[88px] bg-secondary/95 backdrop-blur-2xl border-t border-border/50 z-30 px-4 items-center gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 w-[30%] min-w-0">
          <div
            className="w-14 h-14 rounded-lg overflow-hidden bg-surface flex-shrink-0 cursor-pointer group"
            onClick={() => navigate('/player')}
          >
            {currentTrack.coverUrl ? (
              <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent-secondary/20 flex items-center justify-center">♪</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-text truncate hover:underline cursor-pointer" onClick={() => navigate('/player')}>
              {currentTrack.title}
            </div>
            <div className="text-xs text-muted truncate">{currentTrack.artist.name}</div>
          </div>
          <button className="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-muted hover:text-accent transition-colors">
            ♥
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[40%]">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleShuffle}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isShuffle ? 'text-accent bg-accent/10' : 'text-muted hover:text-text'}`}
              title="Shuffle"
            >
              ⇄
            </button>
            <button
              onClick={previous}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text hover:bg-surface transition-colors"
            >
              ◀◀
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-accent text-background flex items-center justify-center hover:bg-accent-secondary hover:scale-105 transition-all shadow-lg shadow-accent/20"
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><path d="M8 5.14v14l11-7-11-7z" /></svg>
              )}
            </button>
            <button
              onClick={next}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text hover:bg-surface transition-colors"
            >
              ▶▶
            </button>
            <button
              onClick={toggleRepeat}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors relative ${repeatMode !== 'off' ? 'text-accent bg-accent/10' : 'text-muted hover:text-text'}`}
              title={`Repeat: ${repeatMode}`}
            >
              ↻
              {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-bold">1</span>}
            </button>
          </div>

          <div className="flex items-center gap-3 w-full">
            <span className="text-[11px] text-muted tabular-nums w-10 text-right">{formatDuration(progress)}</span>
            <div className="flex-1 relative group h-1 bg-surface rounded-full overflow-hidden cursor-pointer">
              <div className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ left: `calc(${progressPercent}% - 6px)` }} />
            </div>
            <span className="text-[11px] text-muted tabular-nums w-10">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Volume & Queue */}
        <div className="flex items-center gap-2 w-[30%] justify-end">
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setShowVolume(!showVolume)}
              className="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-muted hover:text-text transition-colors"
            >
              {volume === 0 ? '🔇' : volume < 0.5 ? '🔈' : '🔊'}
            </button>
            <div className={`flex items-center gap-2 transition-all ${showVolume ? 'w-24 opacity-100' : 'w-0 opacity-0 overflow-hidden'} lg:w-24 lg:opacity-100`}>
              <div className="flex-1 h-1 bg-surface rounded-full relative">
                <div className="absolute inset-y-0 left-0 bg-text rounded-full" style={{ width: `${volume * 100}%` }} />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setQueueVisible(true)}
            className="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-muted hover:text-text transition-colors"
          >
            ≡
          </button>

          <button
            onClick={() => navigate('/player')}
            className="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-muted hover:text-text transition-colors"
          >
            ⛶
          </button>
        </div>
      </div>

      {/* Mobile Player */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed bottom-[64px] left-2 right-2 h-[64px] bg-surface/90 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl z-30 flex items-center gap-3 px-3"
        onClick={() => navigate('/player')}
      >
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
          {currentTrack.coverUrl ? (
            <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent-secondary/20 flex items-center justify-center">♪</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text truncate">{currentTrack.title}</div>
          <div className="text-xs text-muted truncate">{currentTrack.artist.name}</div>
          <div className="mt-1 h-0.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="w-10 h-10 rounded-full bg-accent text-background flex items-center justify-center flex-shrink-0"
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><path d="M8 5.14v14l11-7-11-7z" /></svg>
          )}
        </button>
      </motion.div>
    </>
  );
}
