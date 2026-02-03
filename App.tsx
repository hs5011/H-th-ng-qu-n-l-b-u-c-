
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import VoterImport from './pages/VoterImport';
import VoterCheckin from './pages/VoterCheckin';
import VoterList from './pages/VoterList';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { AuthState, User } from './types';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('auth');
    return saved ? JSON.parse(saved) : { user: null, isAuthenticated: false };
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  const handleLogin = (user: User) => {
    setAuth({ user, isAuthenticated: true });
    navigate('/');
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    navigate('/login');
  };

  if (!auth.isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (auth.isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {auth.isAuthenticated && <Sidebar user={auth.user} onLogout={handleLogout} />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {auth.isAuthenticated && <Navbar user={auth.user} />}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/voters" element={<VoterList />} />
            <Route path="/voters/import" element={<VoterImport />} />
            <Route path="/voters/checkin" element={<VoterCheckin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
