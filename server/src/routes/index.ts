import { Router } from 'express';
import { register, login, refresh, logout, me, forgotPassword, resetPassword } from '../controllers/authController';
import { listTracks, getTrack, createTrack, updateTrack, deleteTrack, getDownloadUrl, incrementPlayCount } from '../controllers/trackController';
import { listPlaylists, getPlaylist, createPlaylist, updatePlaylist, deletePlaylist, addTrackToPlaylist, removeTrackFromPlaylist, reorderPlaylist } from '../controllers/playlistController';
import { search, getSearchHistory, clearSearchHistory } from '../controllers/searchController';
import {
  listGenres,
  listArtists,
  getArtist,
  listAlbums,
  getAlbum,
  likeTrack,
  unlikeTrack,
  getLikedTracks,
  recordPlayback,
  getPlaybackHistory,
  getRecommendations,
  getTrending,
  getUserProfile,
  updateUserProfile,
  getDownloads,
  adminStats,
  adminUsers,
} from '../controllers/otherControllers';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);
router.get('/auth/me', authenticate, me);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

// Tracks
router.get('/tracks', listTracks);
router.get('/tracks/:id', getTrack);
router.post('/tracks', authenticate, authorize('ADMIN'), createTrack);
router.patch('/tracks/:id', authenticate, authorize('ADMIN'), updateTrack);
router.delete('/tracks/:id', authenticate, authorize('ADMIN'), deleteTrack);
router.get('/tracks/:id/download', authenticate, getDownloadUrl);
router.post('/tracks/:id/play', incrementPlayCount);

// Search
router.get('/search', optionalAuth, search);
router.get('/search/history', authenticate, getSearchHistory);
router.delete('/search/history', authenticate, clearSearchHistory);

// Genres
router.get('/genres', listGenres);

// Artists
router.get('/artists', listArtists);
router.get('/artists/:id', getArtist);

// Albums
router.get('/albums', listAlbums);
router.get('/albums/:id', getAlbum);

// Playlists
router.get('/playlists', optionalAuth, listPlaylists);
router.get('/playlists/:id', optionalAuth, getPlaylist);
router.post('/playlists', authenticate, createPlaylist);
router.patch('/playlists/:id', authenticate, updatePlaylist);
router.delete('/playlists/:id', authenticate, deletePlaylist);
router.post('/playlists/:id/tracks', authenticate, addTrackToPlaylist);
router.delete('/playlists/:id/tracks/:trackId', authenticate, removeTrackFromPlaylist);
router.post('/playlists/:id/reorder', authenticate, reorderPlaylist);

// Likes
router.post('/tracks/:id/like', authenticate, likeTrack);
router.delete('/tracks/:id/like', authenticate, unlikeTrack);
router.get('/likes', authenticate, getLikedTracks);

// History & Playback
router.post('/history', authenticate, recordPlayback);
router.get('/history', authenticate, getPlaybackHistory);

// Recommendations
router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/recommendations/trending', getTrending);
router.get('/recommendations/made-for-you', optionalAuth, getRecommendations);

// User
router.get('/user/profile', authenticate, getUserProfile);
router.patch('/user/profile', authenticate, updateUserProfile);
router.get('/user/downloads', authenticate, getDownloads);

// Admin
router.get('/admin/stats', authenticate, authorize('ADMIN'), adminStats);
router.get('/admin/users', authenticate, authorize('ADMIN'), adminUsers);

export default router;
