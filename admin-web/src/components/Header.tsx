import React from 'react';
import { Bell, Search, Wifi } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { alertas, usuarios } = useAdmin();
  const pendentes = alertas.filter(a => a.ativo).length;
  const inadimplentes = usuarios.filter(u => u.status === 'Bloqueado').length;

  const now = new Date();
  const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const data = now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

  return (
    <header className="header">
      <div>
        <div className="header-title">{title}</div>
        {subtitle && <div className="header-sub">{subtitle}</div>}
      </div>

      <div className="header-spacer" />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', background: 'rgba(34,211,94,0.06)',
        border: '1px solid rgba(34,211,94,0.14)', borderRadius: 20,
        fontSize: 11, color: 'var(--green)', fontWeight: 600
      }}>
        <div className="glow-dot" style={{ width: 6, height: 6 }} />
        Online
      </div>

      <div style={{
        fontSize: 12, color: 'var(--text-muted)',
        padding: '5px 12px', background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)', borderRadius: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.3
      }}>
        <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: 11 }}>{hora}</span>
        <span style={{ fontSize: 9, textTransform: 'capitalize' }}>{data}</span>
      </div>

      {inadimplentes > 0 && (
        <div style={{
          padding: '5px 12px', background: 'rgba(255,58,58,0.07)',
          border: '1px solid rgba(255,58,58,0.18)', borderRadius: 20,
          fontSize: 11, color: 'var(--red)', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          ⚠️ {inadimplentes} inadimplente{inadimplentes > 1 ? 's' : ''}
        </div>
      )}

      <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
        <Bell size={17} />
        {pendentes > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 7, height: 7,
            background: 'var(--red)',
            borderRadius: '50%',
            border: '1.5px solid var(--bg-base)',
            boxShadow: '0 0 6px var(--red)',
          }} />
        )}
      </button>
    </header>
  );
}
