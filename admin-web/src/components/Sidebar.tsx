import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, UserPlus, Bell, ShieldCheck, LogOut, Lock } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { authService } from '../services/authService';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/empresas', icon: Building2, label: 'Empresas' },
  { to: '/funcionarios', icon: Users, label: 'Funcionários' },
  { to: '/visitantes', icon: UserPlus, label: 'Visitantes' },
  { to: '/avisos', icon: Bell, label: 'Avisos' },
  { to: '/acessos', icon: ShieldCheck, label: 'Acessos' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { visitantes, avisos } = useAdmin();

  const aguardando = visitantes.filter(v => v.status === 'Aguardando').length;
  const avisosAtivos = avisos.filter(a => a.ativo).length;

  const badges: Record<string, number> = {
    '/visitantes': aguardando,
    '/avisos': avisosAtivos,
  };

  const handleLogout = () => {
    if (confirm('Deseja sair do sistema?')) {
      authService.logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Lock size={19} color="#fff" />
        </div>
        <div>
          <div className="sidebar-logo-text">NEXTACCESS</div>
          <div className="sidebar-logo-sub">RECEPÇÃO</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu Principal</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
            {badges[to] > 0 && (
              <span className="nav-item-badge">{badges[to]}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{
          padding: '10px 12px', marginBottom: 8,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(76,158,255,0.2), rgba(76,158,255,0.08))',
            border: '1px solid rgba(76,158,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: 'var(--blue)',
          }}>
            R
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Recepcionista</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>recepcao@nextaccess.com</div>
          </div>
        </div>
        <button
          className="nav-item btn-ghost"
          onClick={handleLogout}
          style={{ width: '100%', color: 'var(--text-muted)' }}
        >
          <LogOut size={15} />
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}
