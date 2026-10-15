import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';
import { createPlaylistSchema, updatePlaylistSchema, addTrackToPlaylistSchema, reorderPlaylistSchema } from '../validators/schemas';

export async function listPlaylists(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const ownerId = (req.query.ownerId as string) || userId;
    const isPublic = req.query.isPublic as string | undefined;

    const where: any = {};
    if (ownerId) where.ownerId = ownerId;
    if (isPublic === 'true') where.isPublic = true;
    if (isPublic === 'false') where.isPublic = false;

    // If not owner, only show public
    if (!userId || ownerId !== userId) {
      where.isPublic = true;
    }

    const playlists = await prisma.playlist.findMany({
      where,
      include: {
        owner: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { tracks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, data: playlists });
  } catch (err) {
    next(err);
  }
}

export async function getPlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, username: true, avatarUrl: true } },
        tracks: {
          include: {
            track: {
              include: { artist: true, album: true, genre: true },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!playlist) throw new NotFoundError('Playlist not found');
    if (!playlist.isPublic && playlist.ownerId !== req.user?.userId) {
      throw new ForbiddenError('Private playlist');
    }

    res.json({ success: true, data: playlist });
  } catch (err) {
    next(err);
  }
}

export async function createPlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Authentication required');
    const data = createPlaylistSchema.parse(req.body);

    const playlist = await prisma.playlist.create({
      data: {
        name: data.name,
        description: data.description,
        isPublic: data.isPublic ?? true,
        ownerId: req.user.userId,
      },
      include: {
        owner: { select: { id: true, username: true } },
      },
    });

    res.status(201).json({ success: true, data: playlist });
  } catch (err) {
    next(err);
  }
}

export async function updatePlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Authentication required');
    const { id } = req.params;
    const data = updatePlaylistSchema.parse(req.body);

    const existing = await prisma.playlist.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Playlist not found');
    if (existing.ownerId !== req.user.userId && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('Not owner');
    }

    const playlist = await prisma.playlist.update({
      where: { id },
      data,
      include: { owner: { select: { id: true, username: true } } },
    });

    res.json({ success: true, data: playlist });
  } catch (err) {
    next(err);
  }
}

export async function deletePlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Authentication required');
    const { id } = req.params;

    const existing = await prisma.playlist.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Playlist not found');
    if (existing.ownerId !== req.user.userId && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('Not owner');
    }

    await prisma.playlist.delete({ where: { id } });
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (err) {
    next(err);
  }
}

export async function addTrackToPlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Authentication required');
    const { id } = req.params;
    const { trackId } = addTrackToPlaylistSchema.parse(req.body);

    const playlist = await prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new NotFoundError('Playlist not found');
    if (playlist.ownerId !== req.user.userId && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('Not owner');
    }

    const track = await prisma.track.findUnique({ where: { id: trackId } });
    if (!track) throw new NotFoundError('Track not found');

    const existing = await prisma.playlistTrack.findUnique({
      where: { playlistId_trackId: { playlistId: id, trackId } },
    });
    if (existing) throw new BadRequestError('Track already in playlist');

    const count = await prisma.playlistTrack.count({ where: { playlistId: id } });

    const playlistTrack = await prisma.playlistTrack.create({
      data: { playlistId: id, trackId, position: count },
      include: { track: { include: { artist: true, album: true } } },
    });

    res.status(201).json({ success: true, data: playlistTrack });
  } catch (err) {
    next(err);
  }
}

export async function removeTrackFromPlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Authentication required');
    const { id, trackId } = req.params;

    const playlist = await prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new NotFoundError('Playlist not found');
    if (playlist.ownerId !== req.user.userId && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('Not owner');
    }

    const pt = await prisma.playlistTrack.findUnique({
      where: { playlistId_trackId: { playlistId: id, trackId } },
    });
    if (!pt) throw new NotFoundError('Track not in playlist');

    await prisma.playlistTrack.delete({ where: { id: pt.id } });

    // Reorder positions
    const remaining = await prisma.playlistTrack.findMany({
      where: { playlistId: id },
      orderBy: { position: 'asc' },
    });
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].position !== i) {
        await prisma.playlistTrack.update({ where: { id: remaining[i].id }, data: { position: i } });
      }
    }

    res.json({ success: true, message: 'Track removed' });
  } catch (err) {
    next(err);
  }
}

export async function reorderPlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ForbiddenError('Authentication required');
    const { id } = req.params;
    const { trackIds } = reorderPlaylistSchema.parse(req.body);

    const playlist = await prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new NotFoundError('Playlist not found');
    if (playlist.ownerId !== req.user.userId && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('Not owner');
    }

    for (let i = 0; i < trackIds.length; i++) {
      const trackId = trackIds[i];
      const pt = await prisma.playlistTrack.findUnique({
        where: { playlistId_trackId: { playlistId: id, trackId } },
      });
      if (pt) {
        await prisma.playlistTrack.update({ where: { id: pt.id }, data: { position: i } });
      }
    }

    const updated = await prisma.playlist.findUnique({
      where: { id },
      include: {
        tracks: { include: { track: { include: { artist: true, album: true } } }, orderBy: { position: 'asc' } },
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
