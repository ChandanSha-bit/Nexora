import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import Register from './pages/Register';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import { useAuthStore } from './store/useAuthStore';
import './App.css';

// Guard: Only authenticated users can access these routes
const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuthStore();
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Guard: Already authenticated users get redirected away from auth pages
const GuestRoute = ({ children }) => {
  const { authUser } = useAuthStore();
  if (authUser) {
    return <Navigate to="/chat" replace />;
  }
  return children;
};

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Premium loading screen while verifying session
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-white/5 blur-xl animate-pulse" style={{ width: 80, height: 80, margin: 'auto' }}></div>
          <Loader2 className="h-10 w-10 text-white animate-spin relative z-10" />
        </div>
        <p className="text-gray-500 text-sm font-medium tracking-wide animate-pulse">Verifying session...</p>
      </div>
    );
  }

  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: { background: '#161B22', color: '#fff', fontSize: '14px', border: '1px solid rgba(255,255,255,0.1)' }
        }}
      />
      <Routes>
        <Route
          path="/"
          element={authUser ? <Navigate to="/chat" replace /> : <GuestRoute><Landing /></GuestRoute>}
        />

        {/* Guest-only routes */}
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />

        {/* Protected routes */}
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={authUser ? "/chat" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
