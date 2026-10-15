import bcrypt from 'bcryptjs';
import path from 'path';

// Use mock client directly to avoid needing binary
import { MockPrismaClient } from '../src/config/prismaMock';

const prisma = new MockPrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing
  await prisma.download.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.playbackHistory.deleteMany();
  await prisma.like.deleteMany();
  await prisma.playlistTrack.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.track.deleteMany();
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Genres
  const genresData = [
    { name: 'Pop', slug: 'pop', description: 'Popular music' },
    { name: 'Rock', slug: 'rock', description: 'Rock and roll' },
    { name: 'Hip-Hop', slug: 'hip-hop', description: 'Hip hop beats' },
    { name: 'Electronic', slug: 'electronic', description: 'Electronic dance music' },
    { name: 'Chill', slug: 'chill', description: 'Chill vibes' },
    { name: 'Lo-Fi', slug: 'lo-fi', description: 'Lo-fi beats' },
    { name: 'Instrumental', slug: 'instrumental', description: 'Instrumental tracks' },
    { name: 'Workout', slug: 'workout', description: 'High energy workout' },
    { name: 'Romantic', slug: 'romantic', description: 'Love songs' },
    { name: 'Focus', slug: 'focus', description: 'Focus and concentration' },
    { name: 'Sleep', slug: 'sleep', description: 'Sleep and relaxation' },
    { name: '80s', slug: '80s', description: '80s classics' },
    { name: '90s', slug: '90s', description: '90s throwbacks' },
    { name: '2000s', slug: '2000s', description: '2000s hits' },
  ];

  const genres: Record<string, any> = {};
  for (const g of genresData) {
    const created = await prisma.genre.create({ data: g });
    genres[g.slug] = created;
  }
  console.log(`✅ Created ${Object.keys(genres).length} genres`);

  // Artists
  const artistsData = [
    { name: 'Luna Echo', slug: 'luna-echo', bio: 'Indie pop sensation with ethereal vocals', avatarUrl: 'https://i.pravatar.cc/300?img=1', coverUrl: 'https://picsum.photos/800/400?random=1', verified: true, monthlyListeners: 1250000 },
    { name: 'Neon Dreams', slug: 'neon-dreams', bio: 'Synthwave duo from Berlin', avatarUrl: 'https://i.pravatar.cc/300?img=2', coverUrl: 'https://picsum.photos/800/400?random=2', verified: true, monthlyListeners: 980000 },
    { name: 'Kai Rivera', slug: 'kai-rivera', bio: 'Hip-hop artist and producer', avatarUrl: 'https://i.pravatar.cc/300?img=3', coverUrl: 'https://picsum.photos/800/400?random=3', verified: true, monthlyListeners: 2100000 },
    { name: 'Sora M.', slug: 'sora-m', bio: 'Lo-fi producer from Tokyo', avatarUrl: 'https://i.pravatar.cc/300?img=4', coverUrl: 'https://picsum.photos/800/400?random=4', verified: false, monthlyListeners: 450000 },
    { name: 'The Midnight Waves', slug: 'the-midnight-waves', bio: 'Alternative rock band', avatarUrl: 'https://i.pravatar.cc/300?img=5', coverUrl: 'https://picsum.photos/800/400?random=5', verified: true, monthlyListeners: 760000 },
    { name: 'Ava Sterling', slug: 'ava-sterling', bio: 'Pop vocalist and songwriter', avatarUrl: 'https://i.pravatar.cc/300?img=6', coverUrl: 'https://picsum.photos/800/400?random=6', verified: true, monthlyListeners: 3200000 },
    { name: 'Retro Collective', slug: 'retro-collective', bio: 'Bringing back the 80s sound', avatarUrl: 'https://i.pravatar.cc/300?img=7', coverUrl: 'https://picsum.photos/800/400?random=7', verified: false, monthlyListeners: 540000 },
    { name: 'Jasmine K.', slug: 'jasmine-k', bio: 'R&B soul singer', avatarUrl: 'https://i.pravatar.cc/300?img=8', coverUrl: 'https://picsum.photos/800/400?random=8', verified: true, monthlyListeners: 1800000 },
    { name: 'Pulse Theory', slug: 'pulse-theory', bio: 'Electronic dance music producers', avatarUrl: 'https://i.pravatar.cc/300?img=9', coverUrl: 'https://picsum.photos/800/400?random=9', verified: true, monthlyListeners: 1100000 },
    { name: 'Noah Blake', slug: 'noah-blake', bio: 'Indie folk artist', avatarUrl: 'https://i.pravatar.cc/300?img=10', coverUrl: 'https://picsum.photos/800/400?random=10', verified: false, monthlyListeners: 380000 },
    { name: 'VHS Dreams', slug: 'vhs-dreams', bio: 'Synthwave nostalgia', avatarUrl: 'https://i.pravatar.cc/300?img=11', coverUrl: 'https://picsum.photos/800/400?random=11', verified: false, monthlyListeners: 620000 },
    { name: '90s Revival', slug: '90s-revival', bio: '90s throwback covers', avatarUrl: 'https://i.pravatar.cc/300?img=12', coverUrl: 'https://picsum.photos/800/400?random=12', verified: false, monthlyListeners: 410000 },
    { name: 'Millennium Pop', slug: 'millennium-pop', bio: '2000s pop hits reimagined', avatarUrl: 'https://i.pravatar.cc/300?img=13', coverUrl: 'https://picsum.photos/800/400?random=13', verified: false, monthlyListeners: 530000 },
    { name: 'Zen Flow', slug: 'zen-flow', bio: 'Meditation and focus music', avatarUrl: 'https://i.pravatar.cc/300?img=14', coverUrl: 'https://picsum.photos/800/400?random=14', verified: true, monthlyListeners: 890000 },
    { name: 'Iron Pulse', slug: 'iron-pulse', bio: 'Workout motivation music', avatarUrl: 'https://i.pravatar.cc/300?img=15', coverUrl: 'https://picsum.photos/800/400?random=15', verified: true, monthlyListeners: 670000 },
  ];

  const artists: Record<string, any> = {};
  for (const a of artistsData) {
    const created = await prisma.artist.create({ data: a });
    artists[a.slug] = created;
  }
  console.log(`✅ Created ${Object.keys(artists).length} artists`);

  // Albums
  const albumsData = [
    { title: 'Eternal Echoes', slug: 'eternal-echoes', artistSlug: 'luna-echo', coverUrl: 'https://picsum.photos/400/400?random=20', releaseDate: new Date('2024-03-15') },
    { title: 'Neon Nights', slug: 'neon-nights', artistSlug: 'neon-dreams', coverUrl: 'https://picsum.photos/400/400?random=21', releaseDate: new Date('2024-01-20') },
    { title: 'Flow State', slug: 'flow-state', artistSlug: 'kai-rivera', coverUrl: 'https://picsum.photos/400/400?random=22', releaseDate: new Date('2024-02-10') },
    { title: 'Midnight Study', slug: 'midnight-study', artistSlug: 'sora-m', coverUrl: 'https://picsum.photos/400/400?random=23', releaseDate: new Date('2023-11-05') },
    { title: 'Waves of Yesterday', slug: 'waves-of-yesterday', artistSlug: 'the-midnight-waves', coverUrl: 'https://picsum.photos/400/400?random=24', releaseDate: new Date('1985-06-15') },
    { title: 'Golden Hour', slug: 'golden-hour', artistSlug: 'ava-sterling', coverUrl: 'https://picsum.photos/400/400?random=25', releaseDate: new Date('2024-04-01') },
    { title: 'Synthwave Essentials', slug: 'synthwave-essentials', artistSlug: 'retro-collective', coverUrl: 'https://picsum.photos/400/400?random=26', releaseDate: new Date('1987-08-20') },
    { title: 'Soul Sessions', slug: 'soul-sessions', artistSlug: 'jasmine-k', coverUrl: 'https://picsum.photos/400/400?random=27', releaseDate: new Date('1995-03-10') },
    { title: 'Electric Pulse', slug: 'electric-pulse', artistSlug: 'pulse-theory', coverUrl: 'https://picsum.photos/400/400?random=28', releaseDate: new Date('2005-07-22') },
    { title: 'Focus & Flow', slug: 'focus-and-flow', artistSlug: 'zen-flow', coverUrl: 'https://picsum.photos/400/400?random=29', releaseDate: new Date('2024-05-01') },
    { title: 'Retro Future', slug: 'retro-future', artistSlug: 'vhs-dreams', coverUrl: 'https://picsum.photos/400/400?random=30', releaseDate: new Date('1986-11-12') },
    { title: '90s Love', slug: '90s-love', artistSlug: '90s-revival', coverUrl: 'https://picsum.photos/400/400?random=31', releaseDate: new Date('1992-05-18') },
    { title: '2000s Rewind', slug: '2000s-rewind', artistSlug: 'millennium-pop', coverUrl: 'https://picsum.photos/400/400?random=32', releaseDate: new Date('2003-09-14') },
    { title: 'Power Up', slug: 'power-up', artistSlug: 'iron-pulse', coverUrl: 'https://picsum.photos/400/400?random=33', releaseDate: new Date('2024-06-10') },
  ];

  const albums: Record<string, any> = {};
  for (const al of albumsData) {
    const created = await prisma.album.create({
      data: {
        title: al.title,
        slug: al.slug,
        artistId: artists[al.artistSlug].id,
        coverUrl: al.coverUrl,
        releaseDate: al.releaseDate,
      },
    });
    albums[al.slug] = created;
  }
  console.log(`✅ Created ${Object.keys(albums).length} albums`);

  const audioSamples = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
  ];

  const tracksData = [
    { title: 'Midnight City Lights', artistSlug: 'luna-echo', albumSlug: 'eternal-echoes', genreSlug: 'pop', duration: 215, releaseDate: new Date('2024-08-01'), playCount: 1250000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=100', lyrics: 'City lights are fading...\nNeon dreams in the night...' },
    { title: 'Neon Horizon', artistSlug: 'neon-dreams', albumSlug: 'neon-nights', genreSlug: 'electronic', duration: 198, releaseDate: new Date('2024-07-15'), playCount: 980000, downloadAllowed: false, coverUrl: 'https://picsum.photos/400/400?random=101' },
    { title: 'Flow State', artistSlug: 'kai-rivera', albumSlug: 'flow-state', genreSlug: 'hip-hop', duration: 187, releaseDate: new Date('2024-07-20'), playCount: 2100000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=102' },
    { title: 'Golden Hour Glow', artistSlug: 'ava-sterling', albumSlug: 'golden-hour', genreSlug: 'pop', duration: 203, releaseDate: new Date('2024-08-05'), playCount: 1850000, downloadAllowed: false, coverUrl: 'https://picsum.photos/400/400?random=103' },
    { title: 'Electric Pulse', artistSlug: 'pulse-theory', albumSlug: 'electric-pulse', genreSlug: 'electronic', duration: 225, releaseDate: new Date('2024-06-30'), playCount: 760000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=104' },
    { title: 'Viral Dreams', artistSlug: 'luna-echo', albumSlug: 'eternal-echoes', genreSlug: 'pop', duration: 176, releaseDate: new Date('2024-08-10'), playCount: 3200000, downloadAllowed: false, coverUrl: 'https://picsum.photos/400/400?random=105' },
    { title: 'TikTok Sunset', artistSlug: 'ava-sterling', albumSlug: 'golden-hour', genreSlug: 'pop', duration: 165, releaseDate: new Date('2024-08-12'), playCount: 2800000, downloadAllowed: false, coverUrl: 'https://picsum.photos/400/400?random=106' },
    { title: 'Rising Wave', artistSlug: 'noah-blake', albumSlug: null, genreSlug: 'chill', duration: 201, releaseDate: new Date('2024-08-08'), playCount: 1500000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=107' },
    { title: 'Retro Highway', artistSlug: 'retro-collective', albumSlug: 'synthwave-essentials', genreSlug: '80s', duration: 234, releaseDate: new Date('1985-06-15'), playCount: 450000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=108' },
    { title: 'Neon Dreams 1984', artistSlug: 'vhs-dreams', albumSlug: 'retro-future', genreSlug: '80s', duration: 256, releaseDate: new Date('1984-03-22'), playCount: 380000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=109' },
    { title: 'Synthwave Memories', artistSlug: 'retro-collective', albumSlug: 'synthwave-essentials', genreSlug: '80s', duration: 242, releaseDate: new Date('1986-11-12'), playCount: 520000, downloadAllowed: false, coverUrl: 'https://picsum.photos/400/400?random=110' },
    { title: 'Electric Love 1988', artistSlug: 'the-midnight-waves', albumSlug: 'waves-of-yesterday', genreSlug: 'rock', duration: 198, releaseDate: new Date('1988-07-08'), playCount: 610000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=111' },
    { title: '90s Heartbeat', artistSlug: '90s-revival', albumSlug: '90s-love', genreSlug: '90s', duration: 221, releaseDate: new Date('1992-05-18'), playCount: 890000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=112' },
    { title: 'Soulful Nights', artistSlug: 'jasmine-k', albumSlug: 'soul-sessions', genreSlug: '90s', duration: 245, releaseDate: new Date('1995-03-10'), playCount: 760000, downloadAllowed: false, coverUrl: 'https://picsum.photos/400/400?random=113' },
    { title: 'Grunge Revival', artistSlug: 'the-midnight-waves', albumSlug: 'waves-of-yesterday', genreSlug: 'rock', duration: 189, releaseDate: new Date('1993-09-21'), playCount: 540000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=114' },
    { title: 'Millennium Pop Hit', artistSlug: 'millennium-pop', albumSlug: '2000s-rewind', genreSlug: '2000s', duration: 205, releaseDate: new Date('2003-09-14'), playCount: 1200000, downloadAllowed: false, coverUrl: 'https://picsum.photos/400/400?random=115' },
    { title: 'Electric Dreams 2005', artistSlug: 'pulse-theory', albumSlug: 'electric-pulse', genreSlug: 'electronic', duration: 218, releaseDate: new Date('2005-07-22'), playCount: 980000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=116' },
    { title: 'Pop Anthem 2007', artistSlug: 'ava-sterling', albumSlug: 'golden-hour', genreSlug: 'pop', duration: 192, releaseDate: new Date('2007-04-15'), playCount: 1100000, downloadAllowed: false, coverUrl: 'https://picsum.photos/400/400?random=117' },
    { title: 'Midnight Study Session', artistSlug: 'sora-m', albumSlug: 'midnight-study', genreSlug: 'lo-fi', duration: 167, releaseDate: new Date('2023-11-05'), playCount: 670000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=118' },
    { title: 'Lo-Fi Dreams', artistSlug: 'sora-m', albumSlug: 'midnight-study', genreSlug: 'lo-fi', duration: 182, releaseDate: new Date('2023-12-01'), playCount: 540000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=119' },
    { title: 'Focus Flow', artistSlug: 'zen-flow', albumSlug: 'focus-and-flow', genreSlug: 'focus', duration: 300, releaseDate: new Date('2024-05-01'), playCount: 430000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=120' },
    { title: 'Deep Concentration', artistSlug: 'zen-flow', albumSlug: 'focus-and-flow', genreSlug: 'instrumental', duration: 360, releaseDate: new Date('2024-05-10'), playCount: 320000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=121' },
    { title: 'Power Up', artistSlug: 'iron-pulse', albumSlug: 'power-up', genreSlug: 'workout', duration: 195, releaseDate: new Date('2024-06-10'), playCount: 890000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=122' },
    { title: 'Beast Mode', artistSlug: 'iron-pulse', albumSlug: 'power-up', genreSlug: 'workout', duration: 210, releaseDate: new Date('2024-06-15'), playCount: 760000, downloadAllowed: false, coverUrl: 'https://picsum.photos/400/400?random=123' },
    { title: 'Eternal Love', artistSlug: 'jasmine-k', albumSlug: 'soul-sessions', genreSlug: 'romantic', duration: 267, releaseDate: new Date('2024-02-14'), playCount: 540000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=124' },
    { title: 'Sleep Whispers', artistSlug: 'zen-flow', albumSlug: 'focus-and-flow', genreSlug: 'sleep', duration: 420, releaseDate: new Date('2024-04-20'), playCount: 280000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=125' },
    { title: 'City Pop Revival', artistSlug: 'luna-echo', albumSlug: 'eternal-echoes', genreSlug: 'pop', duration: 208, releaseDate: new Date('2024-07-01'), playCount: 1350000, downloadAllowed: false, coverUrl: 'https://picsum.photos/400/400?random=126' },
    { title: 'Underground Beats', artistSlug: 'kai-rivera', albumSlug: 'flow-state', genreSlug: 'hip-hop', duration: 176, releaseDate: new Date('2024-07-25'), playCount: 1650000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=127' },
    { title: 'Neon Nights Drive', artistSlug: 'neon-dreams', albumSlug: 'neon-nights', genreSlug: 'electronic', duration: 234, releaseDate: new Date('2024-03-10'), playCount: 890000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=128' },
    { title: 'Chill Sunset', artistSlug: 'sora-m', albumSlug: 'midnight-study', genreSlug: 'chill', duration: 195, releaseDate: new Date('2024-01-15'), playCount: 720000, downloadAllowed: true, coverUrl: 'https://picsum.photos/400/400?random=129' },
  ];

  for (let i = 0; i < tracksData.length; i++) {
    const t = tracksData[i];
    const slug = `${t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`;
    const audioUrl = audioSamples[i % audioSamples.length];

    await prisma.track.create({
      data: {
        title: t.title,
        slug,
        artistId: artists[t.artistSlug].id,
        albumId: t.albumSlug ? albums[t.albumSlug]?.id : null,
        genreId: genres[t.genreSlug]?.id || null,
        duration: t.duration,
        audioUrl,
        coverUrl: t.coverUrl,
        releaseDate: t.releaseDate,
        playCount: t.playCount,
        downloadAllowed: t.downloadAllowed,
        lyrics: (t as any).lyrics || null,
      },
    });
  }
  console.log(`✅ Created ${tracksData.length} tracks`);

  const passwordHash = await bcrypt.hash('password123', 12);
  const adminHash = await bcrypt.hash('admin123', 12);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@nextify.com',
      username: 'demouser',
      passwordHash,
      avatarUrl: 'https://i.pravatar.cc/300?img=32',
      emailVerified: true,
      favoriteGenres: JSON.stringify(['pop', 'electronic', 'lo-fi']),
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@nextify.com',
      username: 'admin',
      passwordHash: adminHash,
      avatarUrl: 'https://i.pravatar.cc/300?img=33',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log('✅ Created demo users');

  const allTracks = await prisma.track.findMany({ take: 20 });

  const playlist1 = await prisma.playlist.create({
    data: {
      name: 'My Favorites',
      description: 'All my favorite tracks in one place',
      ownerId: demoUser.id,
      isPublic: false,
    },
  });

  const playlist2 = await prisma.playlist.create({
    data: {
      name: 'Chill Vibes',
      description: 'Perfect for relaxing evenings',
      ownerId: demoUser.id,
      isPublic: true,
      coverImage: 'https://picsum.photos/400/400?random=200',
    },
  });

  const playlist3 = await prisma.playlist.create({
    data: {
      name: 'Workout Energy',
      description: 'High energy tracks for your workout',
      ownerId: demoUser.id,
      isPublic: true,
      coverImage: 'https://picsum.photos/400/400?random=201',
    },
  });

  const playlist4 = await prisma.playlist.create({
    data: {
      name: '80s Essentials',
      description: 'Best of the 80s',
      ownerId: adminUser.id,
      isPublic: true,
      coverImage: 'https://picsum.photos/400/400?random=202',
    },
  });

  for (let i = 0; i < Math.min(10, allTracks.length); i++) {
    await prisma.playlistTrack.create({
      data: { playlistId: playlist1.id, trackId: allTracks[i].id, position: i },
    });
  }

  const chillTracks = await prisma.track.findMany({ where: { genre: { slug: { in: ['chill', 'lo-fi', 'sleep'] } } } as any, take: 8 });
  // For mock, filter manually if above fails
  let chillFiltered = chillTracks;
  if (chillFiltered.length === 0) {
    const all = await prisma.track.findMany();
    chillFiltered = all.filter((t: any) => {
      const g = genres[t.genreId ? Object.keys(genres).find(k => genres[k].id === t.genreId) || '' : ''];
      return ['chill', 'lo-fi', 'sleep'].includes(g?.slug);
    }).slice(0, 8);
    if (chillFiltered.length === 0) {
      chillFiltered = all.slice(0, 5);
    }
  }
  for (let i = 0; i < chillFiltered.length; i++) {
    await prisma.playlistTrack.create({
      data: { playlistId: playlist2.id, trackId: chillFiltered[i].id, position: i },
    });
  }

  const workoutTracks = (await prisma.track.findMany()).filter((t: any) => {
    const genreId = t.genreId;
    const g = Object.values(genres).find((gg: any) => gg.id === genreId);
    return (g as any)?.slug === 'workout';
  }).slice(0, 5);

  for (let i = 0; i < workoutTracks.length; i++) {
    await prisma.playlistTrack.create({
      data: { playlistId: playlist3.id, trackId: workoutTracks[i].id, position: i },
    });
  }

  const eightiesTracks = (await prisma.track.findMany()).filter((t: any) => {
    const genreId = t.genreId;
    const g = Object.values(genres).find((gg: any) => gg.id === genreId);
    return (g as any)?.slug === '80s';
  }).slice(0, 5);

  for (let i = 0; i < eightiesTracks.length; i++) {
    await prisma.playlistTrack.create({
      data: { playlistId: playlist4.id, trackId: eightiesTracks[i].id, position: i },
    });
  }

  console.log('✅ Created playlists');

  for (let i = 0; i < 5; i++) {
    await prisma.like.create({
      data: { userId: demoUser.id, trackId: allTracks[i].id },
    });
  }
  console.log('✅ Created likes');

  for (let i = 0; i < 8; i++) {
    await prisma.playbackHistory.create({
      data: {
        userId: demoUser.id,
        trackId: allTracks[i].id,
        completionPercentage: Math.random() * 0.8 + 0.2,
        playedAt: new Date(Date.now() - i * 3600000),
      },
    });
  }
  console.log('✅ Created playback history');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
