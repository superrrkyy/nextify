import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { recommendationsAPI, tracksAPI, genresAPI } from '../services/api';
import { Track, Genre } from '../types';
import { TrackRow } from '../components/music/TrackRow';
import { MusicCard } from '../components/music/MusicCard';
import { useAudio } from '../context/AudioContext';
import { Button } from '../components/ui/Button';
import { Skeleton, TrackRowSkeleton, CardSkeleton } from '../components/ui/Skeleton';

export function Home() {
  const [trending, setTrending] = useState<Track[]>([]);
  const [madeForYou, setMadeForYou] = useState<Track[]>([]);
  const [viral, setViral] = useState<Track[]>([]);
  const [eighties, setEighties] = useState<Track[]>([]);
  const [nineties, setNineties] = useState<Track[]>([]);
  const [twoThousands, setTwoThousands] = useState<Track[]>([]);
  const [chillTracks, setChillTracks] = useState<Track[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { play, setQueue } = useAudio();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recRes, chillRes, genresRes] = await Promise.all([
          recommendationsAPI.get(),
          tracksAPI.list({ genre: 'chill', limit: 10 }),
          genresAPI.list(),
        ]);

        if (recRes.data.success) {
          const data = recRes.data.data;
          setTrending(data.trending || []);
          setMadeForYou(data.madeForYou || []);
          setViral(data.viral || []);
          setEighties(data.nostalgia?.['80s'] || []);
          setNineties(data.nostalgia?.['90s'] || []);
          setTwoThousands(data.nostalgia?.['2000s'] || []);
        }

        if (chillRes.data.success) {
          setChillTracks(chillRes.data.data || []);
        }

        if (genresRes.data.success) {
          setGenres(genresRes.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch home data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePlayAll = (tracks: Track[]) => {
    if (tracks.length > 0) {
      setQueue(tracks, 0);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8">
        <Skeleton className="h-[400px] rounded-[32px]" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <TrackRowSkeleton key={i} />)}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent-secondary/10 to-transparent" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-accent-secondary/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative px-6 md:px-10 py-16 md:py-24">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-accent">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Now streaming worldwide
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.9] text-text" style={{ fontFamily: 'Space Grotesk' }}>
                Music for
                <br />
                <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                  every version
                </span>
                <br />
                of you.
              </h1>

              <p className="text-lg text-muted max-w-[480px] leading-relaxed">
                Discover trending sounds, timeless classics, and the music that keeps your world moving. Your Sound. Your Era. Your Nextify.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" onClick={() => navigate('/search')} className="group">
                  <span>Explore Music</span>
                  <span className="ml-2 group-hover:translate-x-0.5 transition-transform">→</span>
                </Button>
                <Button variant="secondary" size="lg" onClick={() => handlePlayAll(trending)}>
                  Browse Trending
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img key={i} src={`https://i.pravatar.cc/40?img=${i + 10}`} alt="" className="w-8 h-8 rounded-full border-2 border-background" />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-text">Trusted by 2M+ listeners</div>
                  <div className="text-xs text-muted">Join the community</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:h-[520px] hidden lg:block"
            >
              {/* Floating cards */}
              <div className="absolute inset-0">
                {trending.slice(0, 3).map((track, i) => (
                  <motion.div
                    key={track.id}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, delay: i * 0.8 }}
                    className="absolute"
                    style={{
                      left: `${20 + i * 25}%`,
                      top: `${10 + i * 20}%`,
                      zIndex: 3 - i,
                    }}
                  >
                    <div className="w-[280px] p-4 rounded-2xl bg-surface/80 backdrop-blur-xl border border-border/50 shadow-2xl">
                      <div className="flex gap-3">
                        <img src={track.coverUrl} alt={track.title} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-text truncate">{track.title}</div>
                          <div className="text-xs text-muted truncate">{track.artist.name}</div>
                          <div className="mt-2 flex items-center gap-1">
                            {Array.from({ length: 12 }).map((_, j) => (
                              <div
                                key={j}
                                className="w-0.5 bg-accent/60 rounded-full"
                                style={{ height: `${8 + Math.sin(j + i) * 8 + 8}px` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-accent/20 to-accent-secondary/20 rounded-full blur-[80px]" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="px-6 md:px-10 py-8 space-y-12 max-w-7xl mx-auto">
        {/* Trending Now */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text tracking-tight">Trending Now</h2>
              <p className="text-sm text-muted mt-1">Most played this week</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handlePlayAll(trending)}>Play all</Button>
          </div>

          <div className="rounded-2xl bg-secondary border border-border/30 overflow-hidden">
            {trending.slice(0, 6).map((track, idx) => (
              <TrackRow key={track.id} track={track} index={idx} queue={trending} showIndex />
            ))}
          </div>
        </section>

        {/* Made For You */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text tracking-tight">Made For You</h2>
            <button onClick={() => navigate('/library')} className="text-sm text-muted hover:text-text transition-colors">See all →</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {madeForYou.slice(0, 6).map((track) => (
              <MusicCard key={track.id} track={track} />
            ))}
          </div>
        </section>

        {/* Viral Now */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-text tracking-tight">Viral Now</h2>
            <span className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400">🔥 HOT</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {viral.map((track) => (
              <MusicCard key={track.id} track={track} />
            ))}
          </div>
        </section>

        {/* Genres */}
        <section>
          <h2 className="text-2xl font-bold text-text tracking-tight mb-6">Browse by Era & Mood</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: '80s Essentials', slug: '80s', color: 'from-pink-500 to-orange-500', tracks: eighties },
              { name: '90s Throwback', slug: '90s', color: 'from-blue-500 to-cyan-500', tracks: nineties },
              { name: '2000s Replay', slug: '2000s', color: 'from-violet-500 to-purple-500', tracks: twoThousands },
              { name: 'Chill Nights', slug: 'chill', color: 'from-emerald-500 to-teal-500', tracks: chillTracks },
            ].map((cat) => (
              <div
                key={cat.slug}
                onClick={() => navigate(`/search?q=${cat.slug}`)}
                className={`group relative h-32 rounded-2xl bg-gradient-to-br ${cat.color} p-5 cursor-pointer overflow-hidden hover:scale-[1.02] transition-transform`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <h3 className="font-bold text-white text-lg">{cat.name}</h3>
                  <div className="text-white/80 text-xs">{cat.tracks.length} tracks</div>
                </div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-xl bg-white/20 rotate-12 group-hover:rotate-6 transition-transform" />
              </div>
            ))}
          </div>
        </section>

        {/* Nostalgia */}
        {eighties.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-text tracking-tight mb-6">Back to the Classics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-secondary border border-border/30 p-5">
                <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500" /> 80s Essentials
                </h3>
                <div className="space-y-1">
                  {eighties.slice(0, 4).map((track, idx) => (
                    <TrackRow key={track.id} track={track} index={idx} queue={eighties} showIndex={false} />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-secondary border border-border/30 p-5">
                <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> 90s Throwback
                </h3>
                <div className="space-y-1">
                  {nineties.slice(0, 4).map((track, idx) => (
                    <TrackRow key={track.id} track={track} index={idx} queue={nineties} showIndex={false} />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-secondary border border-border/30 p-5">
                <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" /> 2000s Replay
                </h3>
                <div className="space-y-1">
                  {twoThousands.slice(0, 4).map((track, idx) => (
                    <TrackRow key={track.id} track={track} index={idx} queue={twoThousands} showIndex={false} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Genres list */}
        <section>
          <h2 className="text-xl font-bold text-text mb-4">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => navigate(`/search?q=${genre.slug}`)}
                className="px-4 py-2 rounded-full bg-secondary border border-border/50 text-sm text-muted hover:text-text hover:border-accent/50 hover:bg-surface transition-all"
              >
                {genre.name}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
