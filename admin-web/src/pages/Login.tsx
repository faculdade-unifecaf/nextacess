import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { authService } from '../services/authService';
import { useAdmin } from '../context/AdminContext';

interface LoginProps {
  onLogin: () => void;
}

function LogoPanel() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div style={{
      flex: '0 0 55%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(145deg, #060608 0%, #0a0a12 50%, #0d0d18 100%)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Glow de fundo */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 520, height: 520,
        background: 'radial-gradient(circle, rgba(76,158,255,0.09) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(76,158,255,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Linha decorativa topo */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent 0%, #4c9eff 40%, #1e7ad1 60%, transparent 100%)',
        opacity: 0.6,
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 48px' }}>
        {/* Logo — usa /img/logo.png; cai para ícone se não encontrar */}
        <div style={{
          width: 160, height: 160, margin: '0 auto 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {imgOk ? (
            <img
              src="/img/logo.png"
              alt="NextAccess Logo"
              onError={() => setImgOk(false)}
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 32px rgba(76,158,255,0.4))' }}
            />
          ) : (
            <div style={{
              width: 120, height: 120,
              background: 'linear-gradient(135deg, #4c9eff, #1e7ad1)',
              borderRadius: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 60px rgba(76,158,255,0.35), 0 0 120px rgba(76,158,255,0.1)',
            }}>
              <Lock size={52} color="#fff" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <h1 style={{
          fontSize: 38, fontWeight: 900, letterSpacing: '-1px',
          background: 'linear-gradient(135deg, #ffffff 30%, #a0c4ff 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 10,
        }}>
          NEXTACCESS
        </h1>

        <p style={{
          fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500,
          letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 40,
        }}>
          Sistema de Controle de Acesso
        </p>

        {/* Badges de features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          {[
            { dot: '#4c9eff', text: 'Reconhecimento facial inteligente' },
            { dot: '#22d35e', text: 'Gestão de funcionários e visitantes' },
            { dot: '#ffaa00', text: 'Controle de estacionamento integrado' },
          ].map(({ dot, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 100,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot, boxShadow: `0 0 8px ${dot}` }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé do painel */}
      <p style={{
        position: 'absolute', bottom: 28,
        fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em',
      }}>
        © 2025 NextAccess · Todos os direitos reservados
      </p>
    </div>
  );
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const { refreshAll } = useAdmin();
  const [email, setEmail]     = useState('');
  const [senha, setSenha]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState('');

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
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .login-left  { display: none !important; }
          .login-right { flex: 1 !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>

        {/* ── Painel esquerdo — logo ── */}
        <div className="login-left">
          <LogoPanel />
        </div>

        {/* ── Painel direito — formulário ── */}
        <div className="login-right" style={{
          flex: '0 0 45%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '48px 40px',
          background: 'var(--bg-surface)',
          animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{ width: '100%', maxWidth: 380 }}>

            {/* Cabeçalho do formulário */}
            <div style={{ marginBottom: 36 }}>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: 'var(--blue)',
                marginBottom: 8,
              }}>
                Área Restrita
              </p>
              <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 6 }}>
                Entrar na conta
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Acesso exclusivo para a equipe de recepção
              </p>
            </div>

            {/* Formulário */}
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
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 14, marginTop: 4, gap: 8 }}
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
              marginTop: 28, lineHeight: 1.6,
            }}>
              🔒 Acesso autorizado somente para recepcionistas.<br />
              Em caso de problemas, contate o administrador.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
