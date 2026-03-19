import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    if (senha.length >= 6) {
      onLogin();
      navigate('/', { replace: true });
    } else {
      setErro('Senha inválida. Verifique suas credenciais.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '15%', left: '10%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(255,58,58,0.07) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '8%', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(76,158,255,0.05) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%', maxWidth: 440, padding: '0 20px', position: 'relative', zIndex: 1,
        animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 68, height: 68,
            background: 'linear-gradient(135deg, #ff3a3a, #cc1a1a)',
            borderRadius: 20, margin: '0 auto 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(255,58,58,0.35), 0 0 80px rgba(255,58,58,0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}>
            <Dumbbell size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 4 }}>
            NEXUS FITNESS
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Painel Administrativo
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
          border: '1px solid var(--border-light)',
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)'
          }} />

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 5 }}>Entrar na conta</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Acesso restrito a administradores</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@nexus.com"
                  style={{ paddingLeft: 42 }}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Senha</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingLeft: 42, paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex'
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

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14, marginTop: 4 }}
              disabled={loading}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff',
                    borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite'
                  }} />
                  Autenticando...
                </span>
                : <><ArrowRight size={16} />Entrar no sistema</>}
            </button>
          </form>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 20 }}>
          🔒 Área restrita — acesso autorizado somente para gestores
        </p>
      </div>
    </div>
  );
}
