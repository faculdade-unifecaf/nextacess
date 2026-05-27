import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import { authService } from './services/authService';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Empresas from './pages/Empresas';
import Funcionarios from './pages/Funcionarios';
import Visitantes from './pages/Visitantes';
import Avisos from './pages/Avisos';
import Acessos from './pages/Acessos';

function ProtectedRoute({ children, isAuth }: { children: React.ReactNode; isAuth: boolean }) {
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const [isAuth, setIsAuth] = useState(() => authService.isAuthenticated());
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!checked) {
      const authenticated = authService.isAuthenticated();
      if (authenticated !== isAuth) {
        setIsAuth(authenticated);
      }
      setChecked(true);
    }
  }, [checked, isAuth]);

  return (
    <BrowserRouter>
      <AdminProvider>
        <Routes>
          <Route path="/login" element={
            isAuth ? <Navigate to="/" replace /> : <Login onLogin={() => setIsAuth(true)} />
          } />
          <Route path="/" element={<ProtectedRoute isAuth={isAuth}><Dashboard /></ProtectedRoute>} />
          <Route path="/empresas" element={<ProtectedRoute isAuth={isAuth}><Empresas /></ProtectedRoute>} />
          <Route path="/funcionarios" element={<ProtectedRoute isAuth={isAuth}><Funcionarios /></ProtectedRoute>} />
          <Route path="/visitantes" element={<ProtectedRoute isAuth={isAuth}><Visitantes /></ProtectedRoute>} />
          <Route path="/avisos" element={<ProtectedRoute isAuth={isAuth}><Avisos /></ProtectedRoute>} />
          <Route path="/acessos" element={<ProtectedRoute isAuth={isAuth}><Acessos /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={isAuth ? '/' : '/login'} replace />} />
        </Routes>
      </AdminProvider>
    </BrowserRouter>
  );
}
