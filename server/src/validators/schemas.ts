import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscore'),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const createPlaylistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

export const updatePlaylistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
});

export const addTrackToPlaylistSchema = z.object({
  trackId: z.string().min(1),
});

export const reorderPlaylistSchema = z.object({
  trackIds: z.array(z.string()).min(1),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['all', 'tracks', 'artists', 'albums', 'playlists']).optional().default('all'),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const createTrackSchema = z.object({
  title: z.string().min(1).max(200),
  artistId: z.string().min(1),
  albumId: z.string().optional(),
  genreId: z.string().optional(),
  duration: z.number().min(1),
  audioUrl: z.string().url(),
  coverUrl: z.string().url().optional(),
  isExplicit: z.boolean().optional(),
  downloadAllowed: z.boolean().optional(),
  lyrics: z.string().optional(),
});

export const updateTrackSchema = createTrackSchema.partial();
