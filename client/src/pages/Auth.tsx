import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export function Login() {
  const [email, setEmail] = useState('demo@nextify.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { error, success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-[400px] space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center font-bold text-background text-lg">N</div>
              <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>NEXTIFY</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted mt-2">Log in to your Nextify account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-secondary border border-border/50 text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-secondary border border-border/50 text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted">
                <input type="checkbox" className="rounded" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-accent hover:underline">Forgot password?</Link>
            </div>

            <Button type="submit" size="lg" className="w-full" isLoading={loading}>
              Log in
            </Button>

            <div className="text-center text-sm text-muted">
              Don't have an account? <Link to="/register" className="text-accent hover:underline font-medium">Sign up</Link>
            </div>

            <div className="pt-4 border-t border-border/30 text-xs text-muted space-y-1">
              <div>Demo credentials:</div>
              <div>demo@nextify.com / password123</div>
              <div>admin@nextify.com / admin123</div>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent-secondary/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold tracking-tight leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
              Your Sound.
              <br />
              <span className="text-accent">Your Era.</span>
              <br />
              Your Nextify.
            </h2>
            <p className="text-muted mt-4 leading-relaxed">Premium music streaming, curated for every version of you. Discover trending sounds and timeless classics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { error, success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, username, password);
      success('Account created!');
      navigate('/');
    } catch (err: any) {
      error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-[400px] space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center font-bold text-background text-lg">N</div>
              <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>NEXTIFY</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
            <p className="text-muted mt-2">Start your musical journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-secondary border border-border/50 text-text placeholder:text-muted focus:outline-none focus:border-accent/50"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text mb-1.5 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-secondary border border-border/50 text-text placeholder:text-muted focus:outline-none focus:border-accent/50"
                placeholder="yourname"
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-secondary border border-border/50 text-text placeholder:text-muted focus:outline-none focus:border-accent/50"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <p className="text-xs text-muted mt-1">At least 8 characters</p>
            </div>

            <Button type="submit" size="lg" className="w-full" isLoading={loading}>
              Create account
            </Button>

            <div className="text-center text-sm text-muted">
              Already have an account? <Link to="/login" className="text-accent hover:underline font-medium">Log in</Link>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent-secondary/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold tracking-tight leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
              Join 2M+ listeners on Nextify
            </h2>
            <p className="text-muted mt-4 leading-relaxed">Create playlists, follow artists, and discover music tailored to your taste.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
