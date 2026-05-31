import React from 'react';
import { Sun, Moon, MessageSquare } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenChat: () => void;
}

export default function Header({ title, subtitle, onOpenChat }: HeaderProps) {
  const { visitantes } = useAdmin();
  const aguardando = visitantes.filter(v => v.status === 'Aguardando').length;

  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div>
        <div className="header-title">{title}</div>
        {subtitle && <div className="header-sub">{subtitle}</div>}
      </div>

      <div className="header-spacer" />

      {aguardando > 0 && (
        <div style={{
          padding: '4px 12px',
          background: 'rgba(76,158,255,0.08)',
          border: '1px solid rgba(76,158,255,0.15)',
          borderRadius: 20,
          fontSize: 11, color: 'var(--blue)', fontWeight: 600,
        }}>
          {aguardando} visitante{aguardando > 1 ? 's' : ''} aguardando
        </div>
      )}

      <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}>
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <button className="btn btn-ghost btn-icon" onClick={onOpenChat} title="Chat com administradores" style={{ position: 'relative' }}>
        <MessageSquare size={16} />
      </button>

    </header>
  );
}
