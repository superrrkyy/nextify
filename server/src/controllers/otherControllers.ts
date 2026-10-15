import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';

export async function listGenres(_req: Request, res: Response, next: NextFunction) {
  try {
    const genres = await prisma.genre.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: genres });
  } catch (err) {
    next(err);
  }
}

export async function listArtists(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const artists = await prisma.artist.findMany({
      take: limit,
      orderBy: { monthlyListeners: 'desc' },
    });
    res.json({ success: true, data: artists });
  } catch (err) {
    next(err);
  }
}

export async function getArtist(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        albums: true,
        tracks: { include: { album: true }, take: 10, orderBy: { playCount: 'desc' } },
      },
    });
    if (!artist) throw new NotFoundError('Artist not found');
    res.json({ success: true, data: artist });
  } catch (err) {
    next(err);
  }
}

export async function listAlbums(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const albums = await prisma.album.findMany({
      take: limit,
      include: { artist: true },
      orderBy: { releaseDate: 'desc' },
    });
    res.json({ success: true, data: albums });
  } catch (err) {
    next(err);
  }
}

export async function getAlbum(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        tracks: { include: { artist: true }, orderBy: { createdAt: 'asc' } },
      },
    });
    if (!album) throw new NotFoundError('Album not found');
    res.json({ success: true, data: album });
  } catch (err) {
    next(err);
  }
}

export async function likeTrack(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Auth required');
    const { id } = req.params;
    const track = await prisma.track.findUnique({ where: { id } });
    if (!track) throw new NotFoundError('Track not found');

    const like = await prisma.like.upsert({
      where: { userId_trackId: { userId: req.user.userId, trackId: id } },
      update: {},
      create: { userId: req.user.userId, trackId: id },
    });

    res.json({ success: true, data: like });
  } catch (err) {
    next(err);
  }
}

export async function unlikeTrack(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Auth required');
    const { id } = req.params;

    await prisma.like.deleteMany({
      where: { userId: req.user.userId, trackId: id },
    });

    res.json({ success: true, message: 'Unliked' });
  } catch (err) {
    next(err);
  }
}

export async function getLikedTracks(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Auth required');
    const likes = await prisma.like.findMany({
      where: { userId: req.user.userId },
      include: { track: { include: { artist: true, album: true, genre: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: likes.map((l: any) => l.track) });
  } catch (err) {
    next(err);
  }
}

export async function recordPlayback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Auth required');
    const { trackId, completionPercentage } = req.body;
    if (!trackId) throw new NotFoundError('trackId required');

    const track = await prisma.track.findUnique({ where: { id: trackId } });
    if (!track) throw new NotFoundError('Track not found');

    // Only record if meaningful progress (>10%) and not every second
    const completion = completionPercentage || 0;
    if (completion < 0.1) {
      return res.json({ success: true, message: 'Skipped low completion' });
    }

    const history = await prisma.playbackHistory.create({
      data: {
        userId: req.user.userId,
        trackId,
        completionPercentage: completion,
      },
    });

    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function getPlaybackHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Auth required');
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await prisma.playbackHistory.findMany({
      where: { userId: req.user.userId },
      include: { track: { include: { artist: true, album: true } } },
      orderBy: { playedAt: 'desc' },
      take: limit,
    });
    // Deduplicate to recent unique tracks
    const seen = new Set<string>();
    const unique: typeof history = [];
    for (const h of history) {
      if (!seen.has(h.trackId)) {
        seen.add(h.trackId);
        unique.push(h);
      }
    }
    res.json({ success: true, data: unique });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;

    let favoriteGenreIds: string[] = [];
    let likedArtistIds: string[] = [];

    if (userId) {
      const likes = await prisma.like.findMany({
        where: { userId },
        include: { track: true },
        take: 20,
      });
      const genreCounts: Record<string, number> = {};
      const artistCounts: Record<string, number> = {};
      likes.forEach((l: any) => {
        if (l.track.genreId) genreCounts[l.track.genreId] = (genreCounts[l.track.genreId] || 0) + 1;
        artistCounts[l.track.artistId] = (artistCounts[l.track.artistId] || 0) + 1;
      });
      favoriteGenreIds = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);
      likedArtistIds = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);

      const history = await prisma.playbackHistory.findMany({
        where: { userId },
        include: { track: true },
        orderBy: { playedAt: 'desc' },
        take: 20,
      });
      history.forEach((h: any) => {
        if (h.track.genreId && !favoriteGenreIds.includes(h.track.genreId)) favoriteGenreIds.push(h.track.genreId);
        if (!likedArtistIds.includes(h.track.artistId)) likedArtistIds.push(h.track.artistId);
      });
    }

    // Trending: top playCount
    const trending = await prisma.track.findMany({
      include: { artist: true, album: true, genre: true },
      orderBy: { playCount: 'desc' },
      take: 10,
    });

    // Made for you: based on favorite genres or artists, else random popular
    let madeForYou;
    if (favoriteGenreIds.length > 0) {
      madeForYou = await prisma.track.findMany({
        where: { genreId: { in: favoriteGenreIds } },
        include: { artist: true, album: true, genre: true },
        orderBy: { playCount: 'desc' },
        take: 10,
      });
    } else {
      madeForYou = await prisma.track.findMany({
        include: { artist: true, album: true, genre: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    }

    // Viral: recent with high playCount growth - simplified as recent popular
    let viral = await prisma.track.findMany({
      where: { releaseDate: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
      include: { artist: true, album: true, genre: true },
      orderBy: { playCount: 'desc' },
      take: 10,
    });

    // Fallback so the section is never empty when seed data is older
    if (viral.length === 0) {
      viral = await prisma.track.findMany({
        include: { artist: true, album: true, genre: true },
        orderBy: { playCount: 'desc' },
        take: 10,
      });
    }

    // Nostalgia
    const eighties = await prisma.track.findMany({
      where: { releaseDate: { gte: new Date('1980-01-01'), lt: new Date('1990-01-01') } },
      include: { artist: true, album: true, genre: true },
      take: 10,
    });
    const nineties = await prisma.track.findMany({
      where: { releaseDate: { gte: new Date('1990-01-01'), lt: new Date('2000-01-01') } },
      include: { artist: true, album: true, genre: true },
      take: 10,
    });
    const twoThousands = await prisma.track.findMany({
      where: { releaseDate: { gte: new Date('2000-01-01'), lt: new Date('2010-01-01') } },
      include: { artist: true, album: true, genre: true },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        trending,
        madeForYou,
        viral,
        nostalgia: {
          '80s': eighties,
          '90s': nineties,
          '2000s': twoThousands,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTrending(req: Request, res: Response, next: NextFunction) {
  try {
    const tracks = await prisma.track.findMany({
      include: { artist: true, album: true, genre: true },
      orderBy: { playCount: 'desc' },
      take: 20,
    });
    res.json({ success: true, data: tracks });
  } catch (err) {
    next(err);
  }
}

export async function getUserProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Auth required');
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        role: true,
        favoriteGenres: true,
        createdAt: true,
        _count: { select: { playlists: true, likes: true } },
      },
    });
    if (!user) throw new NotFoundError('User not found');

    const stats = await prisma.playbackHistory.groupBy({
      by: ['trackId'],
      where: { userId: req.user.userId },
      _count: true,
    });

    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          totalPlays: stats.length,
          playlists: user._count.playlists,
          likes: user._count.likes,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Auth required');
    const { username, avatarUrl, favoriteGenres } = req.body;

    const data: any = {};
    if (username) data.username = username;
    if (avatarUrl) data.avatarUrl = avatarUrl;
    if (favoriteGenres) data.favoriteGenres = JSON.stringify(favoriteGenres);

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data,
      select: { id: true, email: true, username: true, avatarUrl: true, favoriteGenres: true },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function getDownloads(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Auth required');
    const downloads = await prisma.download.findMany({
      where: { userId: req.user.userId },
      include: { track: { include: { artist: true, album: true } } },
      orderBy: { downloadedAt: 'desc' },
    });
    res.json({ success: true, data: downloads });
  } catch (err) {
    next(err);
  }
}

export async function adminStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user || req.user.role !== 'ADMIN') throw new ForbiddenError('Admin only');
    const [users, tracks, artists, albums, playlists] = await Promise.all([
      prisma.user.count(),
      prisma.track.count(),
      prisma.artist.count(),
      prisma.album.count(),
      prisma.playlist.count(),
    ]);
    res.json({ success: true, data: { users, tracks, artists, albums, playlists } });
  } catch (err) {
    next(err);
  }
}

export async function adminUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user || req.user.role !== 'ADMIN') throw new ForbiddenError('Admin only');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, username: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}
