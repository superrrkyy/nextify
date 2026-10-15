import React, { createContext, useContext, useRef, useState, useEffect, ReactNode, useCallback } from 'react';
import { Track, RepeatMode } from '../types';
import { tracksAPI, historyAPI } from '../services/api';

interface AudioContextType {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isLoading: boolean;
  error: string | null;
  queueVisible: boolean;
  setQueueVisible: (visible: boolean) => void;
  play: (track?: Track, queue?: Track[]) => Promise<void>;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: (track: Track) => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('nextify-volume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueVisible, setQueueVisible] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const currentTrackRef = useRef<Track | null>(null);
  const nextRef = useRef<() => void>(() => {});
  const progressIntervalRef = useRef<number | null>(null);
  const lastHistoryRecordRef = useRef<number>(0);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleEnded = () => {
      // Record playback history
      const endedTrack = currentTrackRef.current;
      if (endedTrack) {
        const completion = audio.duration ? audio.currentTime / audio.duration : 0;
        if (completion > 0.3 && Date.now() - lastHistoryRecordRef.current > 5000) {
          lastHistoryRecordRef.current = Date.now();
          historyAPI.record(endedTrack.id, completion).catch(() => {});
          tracksAPI.play(endedTrack.id).catch(() => {});
        }
      }

      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextRef.current();
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load audio');
      setIsPlaying(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.src = '';
    };
  }, [repeatMode]);

  // Volume persistence
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem('nextify-volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  // Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist.name,
        album: currentTrack.album?.title || '',
        artwork: currentTrack.coverUrl
          ? [{ src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' }]
          : [],
      });

      navigator.mediaSession.setActionHandler('play', () => resume());
      navigator.mediaSession.setActionHandler('pause', () => pause());
      navigator.mediaSession.setActionHandler('nexttrack', () => next());
      navigator.mediaSession.setActionHandler('previoustrack', () => previous());
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - (details.seekOffset || 10));
        }
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(
            audioRef.current.duration,
            audioRef.current.currentTime + (details.seekOffset || 10)
          );
        }
      });
    }
  }, [currentTrack]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          if (e.shiftKey) {
            e.preventDefault();
            previous();
          } else if (audioRef.current) {
            e.preventDefault();
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
          }
          break;
        case 'ArrowRight':
          if (e.shiftKey) {
            e.preventDefault();
            next();
          } else if (audioRef.current) {
            e.preventDefault();
            audioRef.current.currentTime = Math.min(
              audioRef.current.duration,
              audioRef.current.currentTime + 5
            );
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolumeState((v) => Math.min(1, v + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolumeState((v) => Math.max(0, v - 0.05));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTrack, queue]);

  const play = useCallback(async (track?: Track, newQueue?: Track[]) => {
    try {
      setError(null);
      setIsLoading(true);

      let trackToPlay = track;
      let queueToUse = newQueue || queue;
      let indexToUse = 0;

      if (newQueue && track) {
        const foundIndex = newQueue.findIndex((t) => t.id === track.id);
        indexToUse = foundIndex >= 0 ? foundIndex : 0;
        queueToUse = newQueue;
        trackToPlay = newQueue[indexToUse];
      } else if (track && !newQueue) {
        // Single track play, create queue with just this track if queue empty
        if (queue.length === 0) {
          queueToUse = [track];
          indexToUse = 0;
        } else {
          const existingIndex = queue.findIndex((t) => t.id === track.id);
          if (existingIndex >= 0) {
            indexToUse = existingIndex;
            trackToPlay = queue[existingIndex];
          } else {
            queueToUse = [...queue, track];
            indexToUse = queueToUse.length - 1;
          }
        }
        trackToPlay = track;
      } else if (!track && queue.length > 0) {
        trackToPlay = queue[currentIndex];
        queueToUse = queue;
        indexToUse = currentIndex;
      }

      if (!trackToPlay) {
        setIsLoading(false);
        return;
      }

      if (newQueue) {
        setQueueState(newQueue);
        setCurrentIndex(indexToUse);
      } else if (track && queueToUse !== queue) {
        setQueueState(queueToUse);
        setCurrentIndex(indexToUse);
      }

      setCurrentTrack(trackToPlay);

      if (audioRef.current) {
        audioRef.current.src = trackToPlay.audioUrl;
        audioRef.current.load();
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err: any) {
          if (err.name !== 'NotAllowedError') {
            setError(err.message || 'Playback failed');
          }
          setIsPlaying(false);
        }
      }
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to play track');
    }
  }, [queue, currentIndex]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(async () => {
    if (audioRef.current && currentTrack) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err: any) {
        setError(err.message);
      }
    } else if (currentTrack) {
      play(currentTrack);
    }
  }, [currentTrack, play]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  const getNextIndex = useCallback(() => {
    if (queue.length === 0) return -1;

    if (isShuffle) {
      if (shuffledIndices.length === 0) {
        // Generate shuffled indices excluding current
        const indices = queue.map((_, i) => i).filter((i) => i !== currentIndex);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        setShuffledIndices(indices);
        return indices[0] ?? 0;
      } else {
        const nextIdx = shuffledIndices[0];
        setShuffledIndices((prev) => prev.slice(1));
        return nextIdx;
      }
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx >= queue.length) {
      if (repeatMode === 'all') return 0;
      return -1;
    }
    return nextIdx;
  }, [queue, currentIndex, isShuffle, shuffledIndices, repeatMode]);

  const getPrevIndex = useCallback(() => {
    if (queue.length === 0) return -1;

    // If more than 3 seconds in, restart track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      return currentIndex;
    }

    const prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      if (repeatMode === 'all') return queue.length - 1;
      return 0;
    }
    return prevIdx;
  }, [queue, currentIndex, repeatMode]);

  const next = useCallback(() => {
    const nextIdx = getNextIndex();
    if (nextIdx === -1) {
      setIsPlaying(false);
      return;
    }

    const nextTrack = queue[nextIdx];
    if (nextTrack) {
      setCurrentIndex(nextIdx);
      play(nextTrack);
    }
  }, [getNextIndex, queue, play]);

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const previous = useCallback(() => {
    const prevIdx = getPrevIndex();
    if (prevIdx === currentIndex && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }

    const prevTrack = queue[prevIdx];
    if (prevTrack) {
      setCurrentIndex(prevIdx);
      play(prevTrack);
    }
  }, [getPrevIndex, queue, currentIndex, play]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const newShuffle = !prev;
      if (newShuffle) {
        setShuffledIndices([]);
      }
      return newShuffle;
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueueState((prev) => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueueState((prev) => {
      const newQueue = prev.filter((_, i) => i !== index);
      if (index < currentIndex) {
        setCurrentIndex((ci) => ci - 1);
      } else if (index === currentIndex) {
        // If removing current, stay at same index (now next track)
      }
      return newQueue;
    });
  }, [currentIndex]);

  const clearQueue = useCallback(() => {
    setQueueState([]);
    setCurrentIndex(0);
    setCurrentTrack(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, []);

  const playNext = useCallback((track: Track) => {
    setQueueState((prev) => {
      const newQueue = [...prev];
      newQueue.splice(currentIndex + 1, 0, track);
      return newQueue;
    });
  }, [currentIndex]);

  const setQueue = useCallback((tracks: Track[], startIndex = 0) => {
    setQueueState(tracks);
    setCurrentIndex(startIndex);
    if (tracks[startIndex]) {
      play(tracks[startIndex], tracks);
    }
  }, [play]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        queue,
        currentIndex,
        isPlaying,
        volume,
        progress,
        duration,
        isShuffle,
        repeatMode,
        isLoading,
        error,
        queueVisible,
        setQueueVisible,
        play,
        pause,
        resume,
        togglePlay,
        next,
        previous,
        seek,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playNext,
        setQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
