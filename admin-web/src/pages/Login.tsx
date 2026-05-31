import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield, Sun, Moon } from 'lucide-react';
import { authService } from '../services/authService';
import { useAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate       = useNavigate();
  const { refreshAll } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const [email,    setEmail]    = useState('');
  const [senha,    setSenha]    = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [erro,     setErro]     = useState('');
  const [imgOk,    setImgOk]    = useState(true);

  const logoSrc = theme === 'dark' ? '/img/logo_dark_theme.png' : '/img/logo_light_theme.png';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return; }
    setLoading(true);
    try {
      const response = await authService.login({ email, senha });
      authService.setToken(response.token);
      await refreshAll();
      onLogin();
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setErro(error.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .login-wrap   { display: flex; min-height: 100vh; background: var(--bg-base); }
        .login-left   {
          flex: 0 0 58%; position: relative; overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: linear-gradient(145deg, #060608 0%, #0a0a12 55%, #0d0d1a 100%);
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .login-right  {
          flex: 0 0 42%;
          position: relative;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 56px 48px;
          background: var(--bg-surface);
          animation: fadeUp 0.4s ease;
        }
        @media (max-width: 820px) {
          .login-left  { display: none; }
          .login-right { flex: 1; padding: 40px 28px; }
        }
      `}</style>

      <div className="login-wrap">

        {/* ════════════ PAINEL ESQUERDO — LOGO ════════════ */}
        <div className="login-left">

          {/* Glows de fundo */}
          <div style={{
            position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)',
            width: 560, height: 560,
            background: 'radial-gradient(circle, rgba(76,158,255,0.1) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '8%', right: '0%',
            width: 320, height: 320,
            background: 'radial-gradient(circle, rgba(76,158,255,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Linha decorativa no topo */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent 0%, #4c9eff 45%, #1e7ad1 55%, transparent 100%)',
            opacity: 0.7,
          }} />

          {/* Conteúdo centralizado */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 56px' }}>

            {/* Logo */}
            <div style={{
              width: 172, height: 172, margin: '0 auto 36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {imgOk ? (
                <img
                  src={logoSrc}
                  alt="NextAccess"
                  onError={() => setImgOk(false)}
                  style={{
                    width: '100%', height: '100%', objectFit: 'contain',
                    filter: 'drop-shadow(0 0 36px rgba(76,158,255,0.45))',
                  }}
                />
              ) : (
                <div style={{
                  width: 128, height: 128,
                  background: 'linear-gradient(135deg, #4c9eff, #1e7ad1)',
                  borderRadius: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 64px rgba(76,158,255,0.35), 0 0 130px rgba(76,158,255,0.1)',
                }}>
                  <Lock size={56} color="#fff" strokeWidth={1.5} />
                </div>
              )}
            </div>

            {/* Nome */}
            <h1 style={{
              fontSize: 42, fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 10,
              background: 'linear-gradient(135deg, #ffffff 30%, #a0c8ff 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              NEXTACCESS
            </h1>

            <p style={{
              fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 44,
            }}>
              Sistema de Controle de Acesso
            </p>

            {/* Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              {[
                { color: '#4c9eff', label: 'Reconhecimento facial inteligente' },
                { color: '#22d35e', label: 'Gestão de usuários e visitantes' },
                { color: '#ffaa00', label: 'Controle de estacionamento integrado' },
              ].map(({ color, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 18px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 100,
                }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: color, boxShadow: `0 0 8px ${color}`,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rodapé */}
          <p style={{
            position: 'absolute', bottom: 24, fontSize: 11,
            color: 'var(--text-muted)', letterSpacing: '0.04em',
          }}>
            © 2025 NextAccess · Todos os direitos reservados
          </p>
        </div>

        {/* ════════════ PAINEL DIREITO — FORMULÁRIO ════════════ */}
        <div className="login-right">
          <div style={{ width: '100%', maxWidth: 360 }}>

            {/* Cabeçalho */}
            <div style={{ marginBottom: 36 }}>
              <span style={{
                display: 'inline-block', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--blue)', marginBottom: 10,
                padding: '4px 12px',
                background: 'rgba(76,158,255,0.1)',
                border: '1px solid rgba(76,158,255,0.2)',
                borderRadius: 100,
              }}>
                Área Restrita
              </span>
              <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 6, marginTop: 14 }}>
                Entrar na conta
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Acesso exclusivo para a equipe de recepção
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>E-mail</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', pointerEvents: 'none',
                  }} />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="recepcao@nextaccess.com"
                    style={{ paddingLeft: 42 }} autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Senha</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', pointerEvents: 'none',
                  }} />
                  <input
                    type={showPass ? 'text' : 'password'} value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingLeft: 42, paddingRight: 44 }} autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex',
                  }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {erro && (
                <div className="alert-banner error" style={{ marginBottom: 16, padding: '10px 14px' }}>
                  <Shield size={14} /> {erro}
                </div>
              )}

              <button
                type="submit" className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 14, marginTop: 8, gap: 8 }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 14, height: 14,
                      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                      borderRadius: '50%', display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Autenticando...
                  </>
                ) : (
                  <><ArrowRight size={16} />Entrar no sistema</>
                )}
              </button>
            </form>

            <p style={{
              textAlign: 'center', fontSize: 11, color: 'var(--text-muted)',
              marginTop: 28, lineHeight: 1.7,
            }}>
              🔒 Acesso autorizado somente para recepcionistas.<br />
              Em caso de problemas, contate o administrador.
            </p>
          </div>

          {/* Toggle de tema */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'none', border: '1px solid var(--border-light)',
              borderRadius: 10, padding: '6px 10px', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12,
            }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'Claro' : 'Escuro'}
          </button>
        </div>

      </div>
    </>
  );
}
