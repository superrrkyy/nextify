import { useAudio } from '../context/AudioContext';
import { formatDuration } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { likesAPI, tracksAPI } from '../services/api';
import { useState } from 'react';
import { useToast } from '../components/ui/Toast';

export function FullPlayer() {
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
    queue,
  } = useAudio();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  if (!currentTrack) {
    return (
      <div className="min-h-screen flex items-center justify-center p-10">
        <div className="text-center">
          <div className="text-5xl mb-4">🎵</div>
          <h2 className="text-xl font-semibold mb-2">No track playing</h2>
          <p className="text-muted mb-6">Choose a song to start the immersive experience</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 rounded-full bg-accent text-background font-medium">
            Browse music
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  const handleLike = async () => {
    try {
      if (isLiked) {
        await likesAPI.unlike(currentTrack.id);
        setIsLiked(false);
        success('Removed from liked songs');
      } else {
        await likesAPI.like(currentTrack.id);
        setIsLiked(true);
        success('Added to liked songs');
      }
    } catch {
      error('Failed to update like');
    }
  };

  const handleDownload = async () => {
    if (!currentTrack.downloadAllowed) {
      error('Download not available for this track');
      return;
    }
    try {
      const { data } = await tracksAPI.getDownloadUrl(currentTrack.id);
      if (data.success) {
        window.open(data.data.downloadUrl, '_blank');
        success('Download started');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Download failed');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={currentTrack.coverUrl} alt="" className="w-full h-full object-cover blur-[80px] opacity-30 scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-secondary/80 backdrop-blur border border-border/50 flex items-center justify-center text-text hover:bg-surface transition-colors">
            ↓
          </button>
          <div className="text-center">
            <div className="text-xs font-bold tracking-widest uppercase text-muted">Playing from queue</div>
            <div className="text-sm font-medium text-text">{queue.length} songs</div>
          </div>
          <button className="w-10 h-10 rounded-full bg-secondary/80 backdrop-blur border border-border/50 flex items-center justify-center text-muted">⋯</button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 p-6 lg:p-12 max-w-7xl mx-auto w-full">
          {/* Artwork */}
          <div className="w-full max-w-[480px] aspect-square relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent-secondary/20 rounded-[32px] blur-2xl group-hover:blur-[30px] transition-all" />
            <img src={currentTrack.coverUrl} alt={currentTrack.title} className="relative w-full h-full object-cover rounded-[32px] shadow-2xl" />
            
            {/* Visualizer */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-1 h-12">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-accent rounded-full"
                  style={{
                    height: isPlaying ? `${20 + Math.sin(Date.now() / 200 + i) * 15 + 10}px` : '4px',
                    opacity: isPlaying ? 0.8 : 0.3,
                    transition: 'height 0.2s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Info & Controls */}
          <div className="flex-1 max-w-[560px] w-full space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
                {currentTrack.title}
              </h1>
              <p className="text-xl text-muted mt-3">{currentTrack.artist.name} • {currentTrack.album?.title}</p>
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-secondary border border-border/50 text-xs text-muted">{currentTrack.genre?.name}</span>
                {currentTrack.downloadAllowed && (
                  <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent">Download available</span>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden group cursor-pointer">
                <div className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-muted tabular-nums">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Main controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={toggleShuffle}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isShuffle ? 'text-accent bg-accent/10' : 'text-muted hover:text-text'}`}
              >
                ⇄
              </button>

              <div className="flex items-center gap-4">
                <button onClick={previous} className="w-12 h-12 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-text hover:bg-surface transition-colors">
                  ◀◀
                </button>
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-accent text-background flex items-center justify-center hover:bg-accent-secondary hover:scale-105 transition-all shadow-xl shadow-accent/20"
                >
                  {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M8 5.14v14l11-7-11-7z" /></svg>
                  )}
                </button>
                <button onClick={next} className="w-12 h-12 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-text hover:bg-surface transition-colors">
                  ▶▶
                </button>
              </div>

              <button
                onClick={toggleRepeat}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative ${repeatMode !== 'off' ? 'text-accent bg-accent/10' : 'text-muted hover:text-text'}`}
              >
                ↻
                {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[10px] font-bold">1</span>}
              </button>
            </div>

            {/* Secondary controls */}
            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <div className="flex items-center gap-3">
                <button onClick={handleLike} className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${isLiked ? 'bg-accent text-background border-accent' : 'border-border/50 text-muted hover:text-text'}`}>
                  ♥
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!currentTrack.downloadAllowed}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${currentTrack.downloadAllowed ? 'border-border/50 text-muted hover:text-text hover:border-accent/50' : 'border-border/30 text-muted/30 cursor-not-allowed'}`}
                  title={currentTrack.downloadAllowed ? 'Download' : 'Download not available (legal restriction)'}
                >
                  ↓
                </button>
                <button className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-muted hover:text-text">
                  ↗
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setShowLyrics(!showLyrics)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${showLyrics ? 'bg-accent text-background' : 'bg-secondary border border-border/50 text-muted hover:text-text'}`}>
                  Lyrics
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-muted text-sm">🔊</span>
                  <div className="w-20 h-1 bg-secondary rounded-full relative">
                    <div className="absolute inset-y-0 left-0 bg-text rounded-full" style={{ width: `${volume * 100}%` }} />
                    <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Lyrics */}
            {showLyrics && (
              <div className="rounded-2xl bg-secondary/80 backdrop-blur border border-border/50 p-6 max-h-[200px] overflow-y-auto">
                <h3 className="font-semibold mb-3">Lyrics</h3>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                  {currentTrack.lyrics || 'Lyrics not available for this track.\n\nThis is a demo track from Nextify.\nMusic for every version of you.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
