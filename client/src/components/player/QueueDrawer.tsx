import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../../context/AudioContext';
import { formatDuration } from '../../lib/utils';

export function QueueDrawer() {
  const { queue, currentIndex, queueVisible, setQueueVisible, play, removeFromQueue, clearQueue, currentTrack } = useAudio();

  return (
    <AnimatePresence>
      {queueVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            onClick={() => setQueueVisible(false)}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[380px] max-w-[90vw] bg-secondary border-l border-border/50 z-50 flex flex-col shadow-2xl"
          >
            <div className="p-5 border-b border-border/30 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-text">Queue</h2>
                <p className="text-xs text-muted">{queue.length} songs</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => clearQueue()}
                  className="px-3 py-1.5 rounded-full bg-surface border border-border/50 text-xs text-muted hover:text-text transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setQueueVisible(false)}
                  className="w-8 h-8 rounded-full bg-surface border border-border/50 flex items-center justify-center text-muted hover:text-text"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-6">
              {/* Now Playing */}
              {currentTrack && (
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 px-2">Now Playing</h3>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-accent/20">
                    <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-accent truncate">{currentTrack.title}</div>
                      <div className="text-xs text-muted truncate">{currentTrack.artist.name}</div>
                    </div>
                    <div className="flex gap-0.5">
                      <span className="w-0.5 h-3 bg-accent animate-[wave_0.8s_ease-in-out_infinite]" />
                      <span className="w-0.5 h-3 bg-accent animate-[wave_0.8s_ease-in-out_0.2s_infinite]" />
                      <span className="w-0.5 h-3 bg-accent animate-[wave_0.8s_ease-in-out_0.4s_infinite]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Next Up */}
              <div>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 px-2">Next Up</h3>
                <div className="space-y-1">
                  {queue.slice(currentIndex + 1).map((track, idx) => {
                    const realIndex = currentIndex + 1 + idx;
                    return (
                      <div
                        key={`${track.id}-${realIndex}`}
                        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors"
                      >
                        <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => play(track, queue)}>
                          <div className="text-sm font-medium text-text truncate group-hover:text-accent">{track.title}</div>
                          <div className="text-xs text-muted truncate">{track.artist.name}</div>
                        </div>
                        <span className="text-xs text-muted">{formatDuration(track.duration)}</span>
                        <button
                          onClick={() => removeFromQueue(realIndex)}
                          className="w-6 h-6 rounded-full bg-surface border border-border/50 flex items-center justify-center text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}

                  {queue.length <= currentIndex + 1 && (
                    <div className="text-center py-8 text-muted text-sm">
                      No more songs in queue
                      <br />
                      <span className="text-xs">Add songs to keep the music going</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Previously Played */}
              {currentIndex > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 px-2">Previously</h3>
                  <div className="space-y-1 opacity-60">
                    {queue.slice(0, currentIndex).reverse().slice(0, 5).map((track, idx) => (
                      <div key={`prev-${track.id}-${idx}`} className="flex items-center gap-3 p-2 rounded-xl">
                        <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-text truncate">{track.title}</div>
                          <div className="text-xs text-muted truncate">{track.artist.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
