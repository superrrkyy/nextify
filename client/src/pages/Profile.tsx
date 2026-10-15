import { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await userAPI.profile();
      if (data.success) {
        setProfile(data.data);
        setUsername(data.data.username);
        setAvatarUrl(data.data.avatarUrl || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data } = await userAPI.updateProfile({ username, avatarUrl });
      if (data.success) {
        setProfile(data.data);
        updateUser({ ...user!, username: data.data.username, avatarUrl: data.data.avatarUrl });
        setEditMode(false);
        success('Profile updated');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) {
    return <div className="p-10"><div className="h-64 rounded-2xl bg-secondary animate-pulse" /></div>;
  }

  return (
    <div className="px-6 md:px-10 py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8" style={{ fontFamily: 'Space Grotesk' }}>Profile</h1>

      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        <div className="rounded-2xl bg-secondary border border-border/30 p-6 text-center">
          <img src={profile?.avatarUrl || `https://i.pravatar.cc/200?img=12`} alt={profile?.username} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
          <h2 className="font-semibold text-lg">{profile?.username}</h2>
          <p className="text-sm text-muted">{profile?.email}</p>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-bold text-lg">{profile?.stats?.playlists || 0}</div>
              <div className="text-xs text-muted">Playlists</div>
            </div>
            <div>
              <div className="font-bold text-lg">{profile?.stats?.likes || 0}</div>
              <div className="text-xs text-muted">Liked</div>
            </div>
            <div>
              <div className="font-bold text-lg">{profile?.stats?.totalPlays || 0}</div>
              <div className="text-xs text-muted">Plays</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-secondary border border-border/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Account</h3>
              {!editMode ? (
                <Button variant="ghost" size="sm" onClick={() => setEditMode(true)}>Edit</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSave}>Save</Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted mb-1 block">Username</label>
                {editMode ? (
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-surface border border-border/50 text-text" />
                ) : (
                  <div className="h-11 px-4 rounded-xl bg-surface border border-border/30 flex items-center text-text">{profile?.username}</div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted mb-1 block">Email</label>
                <div className="h-11 px-4 rounded-xl bg-surface border border-border/30 flex items-center text-muted">{profile?.email}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted mb-1 block">Avatar URL</label>
                {editMode ? (
                  <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-surface border border-border/50 text-text" placeholder="https://..." />
                ) : (
                  <div className="h-11 px-4 rounded-xl bg-surface border border-border/30 flex items-center text-muted truncate">{profile?.avatarUrl || 'No avatar'}</div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted mb-1 block">Member since</label>
                <div className="h-11 px-4 rounded-xl bg-surface border border-border/30 flex items-center text-muted">{new Date(profile?.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-secondary border border-border/30 p-6">
            <h3 className="font-semibold mb-4">Listening Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface border border-border/30">
                <div className="text-2xl font-bold">{profile?.stats?.totalPlays || 0}</div>
                <div className="text-xs text-muted">Total plays</div>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-border/30">
                <div className="text-2xl font-bold">{profile?.stats?.playlists || 0}</div>
                <div className="text-xs text-muted">Playlists created</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-secondary border border-border/30 p-6">
            <h3 className="font-semibold mb-4">Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border/30">
                <div>
                  <div className="font-medium text-sm">Email notifications</div>
                  <div className="text-xs text-muted">Get updates about new releases</div>
                </div>
                <div className="w-10 h-6 rounded-full bg-accent p-1">
                  <div className="w-4 h-4 rounded-full bg-background ml-auto" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border/30">
                <div>
                  <div className="font-medium text-sm">High quality streaming</div>
                  <div className="text-xs text-muted">Stream at 320kbps</div>
                </div>
                <div className="w-10 h-6 rounded-full bg-surface border border-border/50 p-1">
                  <div className="w-4 h-4 rounded-full bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div className="px-6 md:px-10 py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8" style={{ fontFamily: 'Space Grotesk' }}>Settings</h1>
      <div className="space-y-6">
        <div className="rounded-2xl bg-secondary border border-border/30 p-6">
          <h3 className="font-semibold mb-2">Appearance</h3>
          <p className="text-sm text-muted mb-4">Nextify uses a premium dark theme optimized for music discovery.</p>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 rounded-full bg-accent text-background text-xs font-medium">Dark premium (active)</div>
            <div className="px-3 py-1.5 rounded-full bg-surface border border-border/50 text-xs text-muted">Light (coming soon)</div>
          </div>
        </div>
        <div className="rounded-2xl bg-secondary border border-border/30 p-6">
          <h3 className="font-semibold mb-2">Playback</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted">Crossfade</span><span>Off</span></div>
            <div className="flex justify-between"><span className="text-muted">Autoplay</span><span>On</span></div>
            <div className="flex justify-between"><span className="text-muted">Normalization</span><span>On</span></div>
          </div>
        </div>
        <div className="rounded-2xl bg-secondary border border-border/30 p-6">
          <h3 className="font-semibold mb-2">Privacy</h3>
          <p className="text-sm text-muted">Your listening data is used to improve recommendations. You can clear history anytime from library.</p>
        </div>
      </div>
    </div>
  );
}
