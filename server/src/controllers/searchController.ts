import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { searchQuerySchema } from '../validators/schemas';
import { AuthRequest } from '../middleware/auth';

export async function search(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { q, type, limit } = searchQuerySchema.parse(req.query);

    const query = q.trim();
    if (!query) {
      return res.json({ success: true, data: { tracks: [], artists: [], albums: [], playlists: [] } });
    }

    // Record search history if authenticated
    if (req.user) {
      await prisma.searchHistory.create({
        data: { userId: req.user.userId, query },
      }).catch(() => {}); // ignore errors
    }

    const lowerQuery = query.toLowerCase();

    const results: any = {};

    if (type === 'all' || type === 'tracks') {
      results.tracks = await prisma.track.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { artist: { name: { contains: query } } },
          ],
        },
        include: { artist: true, album: true, genre: true },
        take: limit,
        orderBy: { playCount: 'desc' },
      });
    }

    if (type === 'all' || type === 'artists') {
      results.artists = await prisma.artist.findMany({
        where: { name: { contains: query } },
        take: limit,
        orderBy: { monthlyListeners: 'desc' },
      });
    }

    if (type === 'all' || type === 'albums') {
      results.albums = await prisma.album.findMany({
        where: { title: { contains: query } },
        include: { artist: true },
        take: limit,
      });
    }

    if (type === 'all' || type === 'playlists') {
      results.playlists = await prisma.playlist.findMany({
        where: {
          isPublic: true,
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: { owner: { select: { id: true, username: true } }, _count: { select: { tracks: true } } },
        take: limit,
      });
    }

    // If specific type, wrap
    if (type !== 'all') {
      res.json({ success: true, data: results[type === 'tracks' ? 'tracks' : type] || [] });
    } else {
      res.json({ success: true, data: results, query });
    }
  } catch (err) {
    next(err);
  }
}

export async function getSearchHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.json({ success: true, data: [] });

    const history = await prisma.searchHistory.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function clearSearchHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.json({ success: true });
    await prisma.searchHistory.deleteMany({ where: { userId: req.user.userId } });
    res.json({ success: true, message: 'History cleared' });
  } catch (err) {
    next(err);
  }
}
