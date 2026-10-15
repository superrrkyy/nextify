import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';
import { paginationSchema, createTrackSchema, updateTrackSchema } from '../validators/schemas';
import { generateDownloadToken } from '../utils/jwt';

export async function listTracks(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const genre = req.query.genre as string | undefined;
    const era = req.query.era as string | undefined;
    const sort = req.query.sort as string | undefined;

    const where: any = {};
    if (genre) {
      const g = await prisma.genre.findUnique({ where: { slug: genre } });
      if (g) where.genreId = g.id;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'popular') orderBy = { playCount: 'desc' };
    if (sort === 'trending') orderBy = { playCount: 'desc' };
    if (sort === 'recent') orderBy = { createdAt: 'desc' };

    // Era filtering via releaseDate - simplified
    if (era) {
      const now = new Date();
      if (era === '80s') {
        where.releaseDate = { gte: new Date('1980-01-01'), lt: new Date('1990-01-01') };
      } else if (era === '90s') {
        where.releaseDate = { gte: new Date('1990-01-01'), lt: new Date('2000-01-01') };
      } else if (era === '2000s') {
        where.releaseDate = { gte: new Date('2000-01-01'), lt: new Date('2010-01-01') };
      }
    }

    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where,
        include: {
          artist: true,
          album: true,
          genre: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.track.count({ where }),
    ]);

    res.json({
      success: true,
      data: tracks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTrack(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const track = await prisma.track.findUnique({
      where: { id },
      include: { artist: true, album: true, genre: true },
    });
    if (!track) throw new NotFoundError('Track not found');
    res.json({ success: true, data: track });
  } catch (err) {
    next(err);
  }
}

export async function createTrack(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user || req.user.role !== 'ADMIN') throw new ForbiddenError('Admin only');
    const data = createTrackSchema.parse(req.body);

    // generate slug
    const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    const track = await prisma.track.create({
      data: {
        title: data.title,
        slug,
        artistId: data.artistId,
        albumId: data.albumId,
        genreId: data.genreId,
        duration: data.duration,
        audioUrl: data.audioUrl,
        coverUrl: data.coverUrl,
        isExplicit: data.isExplicit,
        downloadAllowed: data.downloadAllowed,
        lyrics: data.lyrics,
      },
      include: { artist: true, album: true, genre: true },
    });

    res.status(201).json({ success: true, data: track });
  } catch (err) {
    next(err);
  }
}

export async function updateTrack(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user || req.user.role !== 'ADMIN') throw new ForbiddenError('Admin only');
    const { id } = req.params;
    const data = updateTrackSchema.parse(req.body);

    const existing = await prisma.track.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Track not found');

    const track = await prisma.track.update({
      where: { id },
      data,
      include: { artist: true, album: true, genre: true },
    });

    res.json({ success: true, data: track });
  } catch (err) {
    next(err);
  }
}

export async function deleteTrack(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user || req.user.role !== 'ADMIN') throw new ForbiddenError('Admin only');
    const { id } = req.params;
    const existing = await prisma.track.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Track not found');

    await prisma.track.delete({ where: { id } });
    res.json({ success: true, message: 'Track deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getDownloadUrl(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Authentication required');
    const { id } = req.params;

    const track = await prisma.track.findUnique({ where: { id } });
    if (!track) throw new NotFoundError('Track not found');
    if (!track.downloadAllowed) throw new ForbiddenError('Download not allowed for this track');

    // In production, generate signed S3 URL
    // For demo, return audioUrl with temporary token
    const downloadToken = generateDownloadToken(track.id, req.user.userId);

    // Record download intent
    await prisma.download.upsert({
      where: { userId_trackId: { userId: req.user.userId, trackId: track.id } },
      update: { downloadedAt: new Date(), status: 'COMPLETED' },
      create: { userId: req.user.userId, trackId: track.id, status: 'COMPLETED' },
    });

    res.json({
      success: true,
      data: {
        downloadUrl: `${track.audioUrl}?token=${downloadToken}`,
        filename: `${track.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`,
        expiresIn: 300,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function incrementPlayCount(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const track = await prisma.track.findUnique({ where: { id } });
    if (!track) throw new NotFoundError('Track not found');

    await prisma.track.update({
      where: { id },
      data: { playCount: { increment: 1 } },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
