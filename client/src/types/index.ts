export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  role: string;
  favoriteGenres?: string;
  createdAt?: string;
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  verified: boolean;
  monthlyListeners: number;
  albums?: Album[];
  tracks?: Track[];
}

export interface Album {
  id: string;
  title: string;
  slug: string;
  artistId: string;
  artist?: Artist;
  coverUrl?: string;
  releaseDate?: string;
  tracks?: Track[];
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverUrl?: string;
}

export interface Track {
  id: string;
  title: string;
  slug: string;
  artistId: string;
  artist: Artist;
  albumId?: string;
  album?: Album;
  genreId?: string;
  genre?: Genre;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
  releaseDate?: string;
  isExplicit: boolean;
  downloadAllowed: boolean;
  playCount: number;
  lyrics?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  ownerId: string;
  owner?: { id: string; username: string; avatarUrl?: string };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  tracks?: PlaylistTrack[];
  _count?: { tracks: number };
}

export interface PlaylistTrack {
  id: string;
  playlistId: string;
  trackId: string;
  position: number;
  addedAt: string;
  track: Track;
}

export interface QueueItem {
  track: Track;
  id: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface AudioState {
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
}

export interface SearchResults {
  tracks?: Track[];
  artists?: Artist[];
  albums?: Album[];
  playlists?: Playlist[];
}
