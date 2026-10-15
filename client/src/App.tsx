import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { ToastProvider } from './components/ui/Toast';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Library } from './pages/Library';
import { Playlist } from './pages/Playlist';
import { Login, Register } from './pages/Auth';
import { FullPlayer } from './pages/FullPlayer';
import { Profile, Settings } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Artist, Album } from './pages/Artist';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/search" element={<Layout><Search /></Layout>} />
      <Route path="/library" element={<Layout><Library /></Layout>} />
      <Route path="/playlist/:id" element={<Layout><Playlist /></Layout>} />
      <Route path="/artist/:id" element={<Layout><Artist /></Layout>} />
      <Route path="/album/:id" element={<Layout><Album /></Layout>} />
      <Route path="/player" element={<FullPlayer />} />
      
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><Layout><Admin /></Layout></AdminRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AudioProvider>
            <AppRoutes />
          </AudioProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
