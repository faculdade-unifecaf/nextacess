import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, CreditCard,
  DollarSign, Bell, LogOut, Dumbbell, ChevronRight,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alunos', icon: Users, label: 'Alunos' },
  { to: '/professores', icon: GraduationCap, label: 'Professores' },
  { to: '/planos', icon: CreditCard, label: 'Planos' },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/alertas', icon: Bell, label: 'Alertas' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { usuarios, alertas } = useAdmin();

  const inadimplentes = usuarios.filter(u => u.status === 'Bloqueado').length;
  const alertasNovos = alertas.filter(a => a.ativo).length;

  const badges: Record<string, number> = {
    '/financeiro': inadimplentes,
    '/alertas': alertasNovos,
  };

  const handleLogout = () => {
    if (confirm('Deseja sair do Painel Admin?')) navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Dumbbell size={19} color="#fff" />
        </div>
        <div>
          <div className="sidebar-logo-text">NEXUS</div>
          <div className="sidebar-logo-sub">FITNESS ADMIN</div>
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
            background: 'linear-gradient(135deg, rgba(255,58,58,0.2), rgba(255,58,58,0.08))',
            border: '1px solid rgba(255,58,58,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: 'var(--red)',
          }}>
            A
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Administrador</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>admin@nexus.com</div>
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
