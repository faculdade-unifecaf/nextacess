import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alunos from './pages/Alunos';
import Professores from './pages/Professores';
import Planos from './pages/Planos';
import Financeiro from './pages/Financeiro';
import Alertas from './pages/Alertas';

function ProtectedRoute({ children, isAuth }: { children: React.ReactNode; isAuth: boolean }) {
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <BrowserRouter>
      <AdminProvider>
        <Routes>
          <Route path="/login" element={
            isAuth ? <Navigate to="/" replace /> : <Login onLogin={() => setIsAuth(true)} />
          } />

          <Route path="/" element={<ProtectedRoute isAuth={isAuth}><Dashboard /></ProtectedRoute>} />
          <Route path="/alunos" element={<ProtectedRoute isAuth={isAuth}><Alunos /></ProtectedRoute>} />
          <Route path="/professores" element={<ProtectedRoute isAuth={isAuth}><Professores /></ProtectedRoute>} />
          <Route path="/planos" element={<ProtectedRoute isAuth={isAuth}><Planos /></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute isAuth={isAuth}><Financeiro /></ProtectedRoute>} />
          <Route path="/alertas" element={<ProtectedRoute isAuth={isAuth}><Alertas /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to={isAuth ? '/' : '/login'} replace />} />
        </Routes>
      </AdminProvider>
    </BrowserRouter>
  );
}
