import fs from 'fs';
import path from 'path';

type WhereClause = Record<string, any>;

function matchesWhere(item: any, where: WhereClause): boolean {
  if (!where) return true;
  
  for (const [key, value] of Object.entries(where)) {
    if (key === 'OR') {
      const orConditions = value as WhereClause[];
      if (!orConditions.some((cond) => matchesWhere(item, cond))) return false;
      continue;
    }
    
    if (key === 'AND') {
      const andConditions = value as WhereClause[];
      if (!andConditions.every((cond) => matchesWhere(item, cond))) return false;
      continue;
    }

    const itemValue = item[key];

    if (value === null || value === undefined) {
      if (itemValue !== null && itemValue !== undefined) return false;
      continue;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Handle operators like { contains: ... }, { gte: ... }, { in: ... }
      if ('contains' in value) {
        const search = String(value.contains).toLowerCase();
        const fieldVal = String(itemValue || '').toLowerCase();
        // Support mode insensitive (default in our usage)
        if (!fieldVal.includes(search)) return false;
      } else if ('gte' in value || 'lt' in value || 'lte' in value || 'gt' in value) {
        const itemDate = itemValue ? new Date(itemValue) : null;
        if (!itemDate) return false;
        if ('gte' in value && itemDate < new Date(value.gte)) return false;
        if ('gt' in value && itemDate <= new Date(value.gt)) return false;
        if ('lt' in value && itemDate >= new Date(value.lt)) return false;
        if ('lte' in value && itemDate > new Date(value.lte)) return false;
      } else if ('in' in value) {
        if (!value.in.includes(itemValue)) return false;
      } else if ('equals' in value) {
        if (itemValue !== value.equals) return false;
      } else {
        // Nested relation filter like { name: { contains: ... } }
        // For simplicity, if itemValue is object, recurse
        // If item is relation, we need to handle differently - for now check nested
        if (typeof itemValue === 'object' && itemValue !== null) {
          if (!matchesWhere(itemValue, value)) return false;
        } else {
          // Direct equality
          if (itemValue !== value) return false;
        }
      }
    } else {
      // Direct equality
      if (itemValue !== value) return false;
    }
  }
  return true;
}

function applyOrderBy(items: any[], orderBy: any): any[] {
  if (!orderBy) return items;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  
  return [...items].sort((a, b) => {
    for (const order of orders) {
      const [field, direction] = Object.entries(order)[0] as [string, string];
      let aVal = a[field];
      let bVal = b[field];
      
      // Handle nested like { playCount: 'desc' }
      if (aVal === undefined && bVal === undefined) continue;
      
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';
      
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = (aVal as any) - (bVal as any);
      }
      
      if (comparison !== 0) {
        return direction === 'desc' ? -comparison : comparison;
      }
    }
    return 0;
  });
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

class MockModel {
  name: string;
  data: any[];
  private db: MockPrismaClient;
  private relations: Record<string, { model: string; foreignKey?: string; type: 'belongsTo' | 'hasMany' }>;

  constructor(name: string, db: MockPrismaClient, relations: any = {}) {
    this.name = name;
    this.data = [];
    this.db = db;
    this.relations = relations;
  }

  private resolveIncludes(item: any, include: any): any {
    if (!include) return item;
    const result = { ...item };
    
    for (const [key, value] of Object.entries(include)) {
      if (key === '_count') {
        const countSelect = (value as any).select;
        result._count = {};
        for (const countKey of Object.keys(countSelect)) {
          if (countKey === 'tracks') {
            if (this.name === 'playlist') {
              result._count.tracks = this.db.playlistTrack.data.filter((pt: any) => pt.playlistId === item.id).length;
            } else if (this.name === 'artist') {
              result._count.tracks = this.db.track.data.filter((t: any) => t.artistId === item.id).length;
            } else if (this.name === 'album') {
              result._count.tracks = this.db.track.data.filter((t: any) => t.albumId === item.id).length;
            }
          } else if (countKey === 'playlists' && this.name === 'user') {
            result._count.playlists = this.db.playlist.data.filter((p: any) => p.ownerId === item.id).length;
          } else if (countKey === 'likes' && this.name === 'user') {
            result._count.likes = this.db.like.data.filter((l: any) => l.userId === item.id).length;
          } else if (countKey === 'albums' && this.name === 'artist') {
            result._count.albums = this.db.album.data.filter((a: any) => a.artistId === item.id).length;
          }
        }
        continue;
      }

      const relation = this.relations[key];
      if (!relation) continue;

      if (relation.type === 'belongsTo') {
        const foreignKey = relation.foreignKey || `${key}Id`;
        const relatedId = item[foreignKey];
        if (relatedId) {
          const relatedModel = (this.db as any)[relation.model] as MockModel;
          if (relatedModel) {
            const related = relatedModel.data.find((r: any) => r.id === relatedId);
            if (related) {
              if (value === true) {
                result[key] = { ...related };
              } else if (typeof value === 'object' && (value as any).include) {
                result[key] = relatedModel.resolveIncludes(related, (value as any).include);
              } else if (typeof value === 'object' && (value as any).select) {
                const selected: any = {};
                for (const selKey of Object.keys((value as any).select)) {
                  selected[selKey] = related[selKey];
                }
                result[key] = selected;
              } else {
                result[key] = { ...related };
              }
            }
          }
        }
      } else if (relation.type === 'hasMany') {
        const relatedModel = (this.db as any)[relation.model] as MockModel;
        if (relatedModel) {
          const foreignKey = relation.foreignKey || `${this.name}Id`;
          // Special cases
          let filtered = relatedModel.data.filter((r: any) => r[foreignKey] === item.id);
          
          if (typeof value === 'object') {
            if ((value as any).where) {
              filtered = filtered.filter((r: any) => matchesWhere(r, (value as any).where));
            }
            if ((value as any).orderBy) {
              filtered = applyOrderBy(filtered, (value as any).orderBy);
            }
            if ((value as any).take) {
              filtered = filtered.slice(0, (value as any).take);
            }
            if ((value as any).include) {
              filtered = filtered.map((r: any) => relatedModel.resolveIncludes(r, (value as any).include));
            }
          }
          
          result[key] = filtered;
        }
      }
    }
    
    return result;
  }

  async findMany(args: any = {}): Promise<any[]> {
    let result = [...this.data];

    if (args.where) {
      // Handle special nested where for artist filtering inside track
      // For track where: { artist: { name: { contains: ... } } } we need custom handling
      // Our matchesWhere handles some nested but not deep relation filtering
      // For simplicity, we handle track's artist filter manually
      if (this.name === 'track' && args.where.OR) {
        const or = args.where.OR;
        result = result.filter((item) => {
          return or.some((cond: any) => {
            if (cond.title && cond.title.contains) {
              return String(item.title).toLowerCase().includes(String(cond.title.contains).toLowerCase());
            }
            if (cond.artist && cond.artist.name && cond.artist.name.contains) {
              const artist = this.db.artist.data.find((a: any) => a.id === item.artistId);
              if (!artist) return false;
              return String(artist.name).toLowerCase().includes(String(cond.artist.name.contains).toLowerCase());
            }
            return false;
          });
        });
      } else if (this.name === 'playlist' && args.where.OR) {
        const or = args.where.OR;
        result = result.filter((item) => {
          return or.some((cond: any) => {
            if (cond.name && cond.name.contains) {
              return String(item.name).toLowerCase().includes(String(cond.name.contains).toLowerCase());
            }
            if (cond.description && cond.description.contains) {
              return String(item.description || '').toLowerCase().includes(String(cond.description.contains).toLowerCase());
            }
            return false;
          });
        });
        // Also handle isPublic filter
        if (args.where.isPublic !== undefined) {
          result = result.filter((item) => item.isPublic === args.where.isPublic);
        }
      } else {
        result = result.filter((item) => matchesWhere(item, args.where));
      }
    }

    if (args.orderBy) {
      result = applyOrderBy(result, args.orderBy);
    }

    if (args.skip) {
      result = result.slice(args.skip);
    }

    if (args.take) {
      result = result.slice(0, args.take);
    }

    if (args.include) {
      result = result.map((item) => this.resolveIncludes(item, args.include));
    }

    if (args.select) {
      result = result.map((item) => {
        const selected: any = {};
        for (const key of Object.keys(args.select)) {
          if (args.select[key]) {
            if (key === '_count') {
              selected._count = {};
              for (const countKey of Object.keys(args.select._count.select)) {
                if (countKey === 'tracks') {
                  if (this.name === 'playlist') {
                    selected._count.tracks = this.db.playlistTrack.data.filter((pt: any) => pt.playlistId === item.id).length;
                  } else if (this.name === 'artist') {
                    selected._count.tracks = this.db.track.data.filter((t: any) => t.artistId === item.id).length;
                  } else if (this.name === 'album') {
                    selected._count.tracks = this.db.track.data.filter((t: any) => t.albumId === item.id).length;
                  }
                } else if (countKey === 'playlists' && this.name === 'user') {
                  selected._count.playlists = this.db.playlist.data.filter((p: any) => p.ownerId === item.id).length;
                } else if (countKey === 'likes' && this.name === 'user') {
                  selected._count.likes = this.db.like.data.filter((l: any) => l.userId === item.id).length;
                } else if (countKey === 'albums' && this.name === 'artist') {
                  selected._count.albums = this.db.album.data.filter((a: any) => a.artistId === item.id).length;
                }
              }
            } else {
              selected[key] = item[key];
            }
          }
        }
        return selected;
      });
    }

    return result;
  }

  async findUnique(args: any): Promise<any | null> {
    const where = args.where;
    let item: any = null;

    if (where.id) {
      item = this.data.find((d) => d.id === where.id) || null;
    } else if (where.email) {
      item = this.data.find((d) => d.email === where.email) || null;
    } else if (where.username) {
      item = this.data.find((d) => d.username === where.username) || null;
    } else if (where.slug) {
      item = this.data.find((d) => d.slug === where.slug) || null;
    } else if (where.refreshToken) {
      item = this.data.find((d) => d.refreshToken === where.refreshToken) || null;
    } else if (where.userId_trackId) {
      const { userId, trackId } = where.userId_trackId;
      item = this.data.find((d) => d.userId === userId && d.trackId === trackId) || null;
    } else if (where.playlistId_trackId) {
      const { playlistId, trackId } = where.playlistId_trackId;
      item = this.data.find((d) => d.playlistId === playlistId && d.trackId === trackId) || null;
    } else if (where.userId_artistId) {
      const { userId, artistId } = where.userId_artistId;
      item = this.data.find((d) => d.userId === userId && d.artistId === artistId) || null;
    } else {
      // Generic
      const keys = Object.keys(where);
      item = this.data.find((d) => keys.every((k) => d[k] === where[k])) || null;
    }

    if (!item) return null;

    if (args.include) {
      return this.resolveIncludes(item, args.include);
    }

    if (args.select) {
      const selected: any = {};
      for (const key of Object.keys(args.select)) {
        if (args.select[key]) {
          selected[key] = item[key];
        }
      }
      // Handle nested selects like owner: { select: ... }
      for (const key of Object.keys(args.select)) {
        if (typeof args.select[key] === 'object' && args.select[key].select) {
          const relation = this.relations[key];
          if (relation) {
            const foreignKey = relation.foreignKey || `${key}Id`;
            const relatedId = item[foreignKey];
            if (relatedId) {
              const relatedModel = (this.db as any)[relation.model] as MockModel;
              const related = relatedModel.data.find((r: any) => r.id === relatedId);
              if (related) {
                const sel: any = {};
                for (const selKey of Object.keys(args.select[key].select)) {
                  sel[selKey] = related[selKey];
                }
                selected[key] = sel;
              }
            }
          }
        }
      }
      return selected;
    }

    return { ...item };
  }

  async create(args: any): Promise<any> {
    const data = { ...args.data };
    if (!data.id) data.id = generateId();
    if (!data.createdAt) data.createdAt = new Date();
    if (!data.updatedAt) data.updatedAt = new Date();
    if (this.name === 'track' && !data.playCount) data.playCount = 0;
    if (this.name === 'artist' && !data.monthlyListeners) data.monthlyListeners = 0;
    
    this.data.push(data);
    this.db.save();

    if (args.include) {
      return this.resolveIncludes(data, args.include);
    }

    return { ...data };
  }

  async update(args: any): Promise<any> {
    const index = this.data.findIndex((d) => d.id === args.where.id);
    if (index === -1) throw new Error(`${this.name} not found`);
    
    const updated = { ...this.data[index], ...args.data, updatedAt: new Date() };
    
    // Handle increment
    for (const [key, value] of Object.entries(args.data)) {
      if (typeof value === 'object' && value !== null && 'increment' in (value as any)) {
        updated[key] = (this.data[index][key] || 0) + (value as any).increment;
      }
    }
    
    this.data[index] = updated;
    this.db.save();

    if (args.include) {
      return this.resolveIncludes(updated, args.include);
    }

    return { ...updated };
  }

  async delete(args: any): Promise<any> {
    const index = this.data.findIndex((d) => d.id === args.where.id);
    if (index === -1) throw new Error(`${this.name} not found`);
    const deleted = this.data[index];
    this.data.splice(index, 1);
    this.db.save();
    return deleted;
  }

  async deleteMany(args: any = {}): Promise<{ count: number }> {
    if (!args.where || Object.keys(args.where).length === 0) {
      const count = this.data.length;
      this.data = [];
      this.db.save();
      return { count };
    }

    const before = this.data.length;
    this.data = this.data.filter((item) => !matchesWhere(item, args.where));
    const count = before - this.data.length;
    this.db.save();
    return { count };
  }

  async count(args: any = {}): Promise<number> {
    if (!args.where) return this.data.length;
    return this.data.filter((item) => matchesWhere(item, args.where)).length;
  }

  async upsert(args: any): Promise<any> {
    const existing = await this.findUnique({ where: args.where });
    if (existing) {
      return this.update({ where: args.where, data: args.update });
    } else {
      return this.create({ data: args.create });
    }
  }

  async groupBy(args: any): Promise<any[]> {
    const by = args.by as string[];
    const where = args.where;
    let items = [...this.data];
    if (where) {
      items = items.filter((item) => matchesWhere(item, where));
    }
    
    const groups: Record<string, any> = {};
    for (const item of items) {
      const key = by.map((b) => item[b]).join('|');
      if (!groups[key]) {
        groups[key] = { ...by.reduce((acc, b) => ({ ...acc, [b]: item[b] }), {}), _count: 0 };
      }
      groups[key]._count++;
    }
    
    return Object.values(groups);
  }
}

export class MockPrismaClient {
  user: MockModel;
  session: MockModel;
  genre: MockModel;
  artist: MockModel;
  album: MockModel;
  track: MockModel;
  playlist: MockModel;
  playlistTrack: MockModel;
  like: MockModel;
  playbackHistory: MockModel;
  searchHistory: MockModel;
  favoriteArtist: MockModel;
  download: MockModel;

  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, '../../prisma/dev.db.json');
    
    // Define relations
    this.user = new MockModel('user', this);
    this.session = new MockModel('session', this, {
      user: { model: 'user', foreignKey: 'userId', type: 'belongsTo' },
    });
    this.genre = new MockModel('genre', this);
    this.artist = new MockModel('artist', this, {
      tracks: { model: 'track', foreignKey: 'artistId', type: 'hasMany' },
      albums: { model: 'album', foreignKey: 'artistId', type: 'hasMany' },
    });
    this.album = new MockModel('album', this, {
      artist: { model: 'artist', foreignKey: 'artistId', type: 'belongsTo' },
      tracks: { model: 'track', foreignKey: 'albumId', type: 'hasMany' },
    });
    this.track = new MockModel('track', this, {
      artist: { model: 'artist', foreignKey: 'artistId', type: 'belongsTo' },
      album: { model: 'album', foreignKey: 'albumId', type: 'belongsTo' },
      genre: { model: 'genre', foreignKey: 'genreId', type: 'belongsTo' },
    });
    this.playlist = new MockModel('playlist', this, {
      owner: { model: 'user', foreignKey: 'ownerId', type: 'belongsTo' },
      tracks: { model: 'playlistTrack', foreignKey: 'playlistId', type: 'hasMany' },
    });
    this.playlistTrack = new MockModel('playlistTrack', this, {
      playlist: { model: 'playlist', foreignKey: 'playlistId', type: 'belongsTo' },
      track: { model: 'track', foreignKey: 'trackId', type: 'belongsTo' },
    });
    this.like = new MockModel('like', this, {
      user: { model: 'user', foreignKey: 'userId', type: 'belongsTo' },
      track: { model: 'track', foreignKey: 'trackId', type: 'belongsTo' },
    });
    this.playbackHistory = new MockModel('playbackHistory', this, {
      user: { model: 'user', foreignKey: 'userId', type: 'belongsTo' },
      track: { model: 'track', foreignKey: 'trackId', type: 'belongsTo' },
    });
    this.searchHistory = new MockModel('searchHistory', this, {
      user: { model: 'user', foreignKey: 'userId', type: 'belongsTo' },
    });
    this.favoriteArtist = new MockModel('favoriteArtist', this, {
      user: { model: 'user', foreignKey: 'userId', type: 'belongsTo' },
      artist: { model: 'artist', foreignKey: 'artistId', type: 'belongsTo' },
    });
    this.download = new MockModel('download', this, {
      user: { model: 'user', foreignKey: 'userId', type: 'belongsTo' },
      track: { model: 'track', foreignKey: 'trackId', type: 'belongsTo' },
    });

    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        const data = JSON.parse(content);
        this.user.data = data.user || [];
        this.session.data = data.session || [];
        this.genre.data = data.genre || [];
        this.artist.data = data.artist || [];
        this.album.data = data.album || [];
        this.track.data = data.track || [];
        this.playlist.data = data.playlist || [];
        this.playlistTrack.data = data.playlistTrack || [];
        this.like.data = data.like || [];
        this.playbackHistory.data = data.playbackHistory || [];
        this.searchHistory.data = data.searchHistory || [];
        this.favoriteArtist.data = data.favoriteArtist || [];
        this.download.data = data.download || [];
      }
    } catch (e) {
      console.warn('Failed to load mock DB, starting fresh', e);
    }
  }

  save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const data = {
        user: this.user.data,
        session: this.session.data,
        genre: this.genre.data,
        artist: this.artist.data,
        album: this.album.data,
        track: this.track.data,
        playlist: this.playlist.data,
        playlistTrack: this.playlistTrack.data,
        like: this.like.data,
        playbackHistory: this.playbackHistory.data,
        searchHistory: this.searchHistory.data,
        favoriteArtist: this.favoriteArtist.data,
        download: this.download.data,
      };
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to save mock DB', e);
    }
  }

  async $connect() {
    // No-op for mock
    return;
  }

  async $disconnect() {
    this.save();
    return;
  }
}
