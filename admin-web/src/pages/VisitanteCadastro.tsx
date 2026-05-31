import React, { useEffect, useState } from 'react';
import { CheckCircle, User, Mail, Phone, Building2, FileText, Calendar, Clock, AlertCircle, ArrowRight } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? 'http://192.168.0.104:3000/api';

interface Empresa { id: string; nome: string; andar: number; sala: string }

type Step = 'form' | 'loading' | 'success' | 'error';

const maskCpf = (v: string) => {
  const c = v.replace(/\D/g, '').slice(0, 11);
  if (c.length <= 3)  return c;
  if (c.length <= 6)  return `${c.slice(0,3)}.${c.slice(3)}`;
  if (c.length <= 9)  return `${c.slice(0,3)}.${c.slice(3,6)}.${c.slice(6)}`;
  return `${c.slice(0,3)}.${c.slice(3,6)}.${c.slice(6,9)}-${c.slice(9)}`;
};

const maskPhone = (v: string) => {
  const c = v.replace(/\D/g, '').slice(0, 11);
  if (c.length <= 2)  return c.length ? `(${c}` : '';
  if (c.length <= 6)  return `(${c.slice(0,2)}) ${c.slice(2)}`;
  if (c.length <= 10) return `(${c.slice(0,2)}) ${c.slice(2,6)}-${c.slice(6)}`;
  return `(${c.slice(0,2)}) ${c.slice(2,7)}-${c.slice(7)}`;
};

export default function VisitanteCadastro() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [step, setStep]         = useState<Step>('form');
  const [errMsg, setErrMsg]     = useState('');
  const [form, setForm]         = useState({
    nome_completo: '',
    cpf:           '',
    email:         '',
    telefone:      '',
    empresa_id:    '',
    motivo:        '',
    data_visita:   '',
    hora_prevista: '',
  });

  useEffect(() => {
    fetch(`${API}/publico/empresas`)
      .then(r => r.json())
      .then(setEmpresas)
      .catch(() => {});
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome_completo || !form.cpf || !form.email || !form.empresa_id || !form.motivo || !form.data_visita || !form.hora_prevista) return;
    setStep('loading');
    try {
      const res = await fetch(`${API}/publico/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 409) throw new Error('Este CPF já possui um cadastro no sistema. Caso precise de acesso, entre em contato com a recepção.');
      if (!res.ok) throw new Error(data.error ?? 'Erro ao cadastrar.');
      setStep('success');
    } catch (err: any) {
      setErrMsg(err.message ?? 'Erro inesperado. Tente novamente.');
      setStep('error');
    }
  };

  const hoje = new Date().toISOString().slice(0, 10);
  const empresa = empresas.find(e => e.id === form.empresa_id);

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin   { to { transform:rotate(360deg) } }
        .vc-wrap    { min-height:100vh; background:linear-gradient(145deg,#060608 0%,#0a0a12 55%,#0d0d1a 100%); display:flex; align-items:center; justify-content:center; padding:24px 16px; }
        .vc-card    { width:100%; max-width:520px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:24px; overflow:hidden; animation:fadeUp .35s ease; }
        .vc-header  { background:linear-gradient(135deg,rgba(76,158,255,0.12),rgba(76,158,255,0.04)); border-bottom:1px solid rgba(255,255,255,0.06); padding:32px 36px 28px; text-align:center; }
        .vc-body    { padding:32px 36px; }
        .vc-label   { display:block; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-bottom:7px; }
        .vc-input   { width:100%; padding:11px 14px 11px 40px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#fff; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box; transition:border-color .2s; }
        .vc-input:focus { border-color:#4c9eff; background:rgba(76,158,255,0.06); }
        .vc-input::placeholder { color:rgba(255,255,255,0.2); }
        .vc-input-wrap { position:relative; }
        .vc-input-wrap svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.25); pointer-events:none; }
        .vc-select  { padding-left:40px; appearance:none; cursor:pointer; }
        .vc-row     { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .vc-btn     { width:100%; padding:14px; background:linear-gradient(135deg,#4c9eff,#1e7ad1); border:none; border-radius:12px; color:#fff; font-size:15px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:8px; transition:opacity .2s; }
        .vc-btn:hover { opacity:.9; }
        .vc-btn:disabled { opacity:.5; cursor:not-allowed; }
        @media(max-width:480px) { .vc-row { grid-template-columns:1fr } .vc-body,.vc-header { padding:24px 20px } }
      `}</style>

      <div className="vc-wrap">
        <div className="vc-card">

          {/* Header */}
          <div className="vc-header">
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '3px', color: '#fff', marginBottom: 4 }}>
              NEXTACCESS
            </div>
            <div style={{ fontSize: 10, color: '#4c9eff', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 20 }}>
              Sistema de Controle de Acesso
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
              Cadastro de Visitante
            </h1>
            {step === 'form' && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
                Preencha o formulário abaixo. Você receberá um QR Code no seu e-mail para registrar entrada e saída.
              </p>
            )}
          </div>

          <div className="vc-body">

            {/* SUCCESS */}
            {step === 'success' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'rgba(34,211,94,0.12)', border: '1px solid rgba(34,211,94,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle size={34} color="#22d35e" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>
                  Cadastro concluído!
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 24px' }}>
                  Após a empresa aprovar o seu acesso, você receberá o QR Code de liberação em<br />
                  <strong style={{ color: '#4c9eff' }}>{form.email}</strong>
                </p>
                {empresa && (
                  <div style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, padding: '14px 18px', textAlign: 'left', marginBottom: 20,
                  }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Detalhes da visita</div>
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>{empresa.nome}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                      {empresa.andar}º andar · Sala {empresa.sala} · {form.data_visita.split('-').reverse().join('/')}
                    </div>
                  </div>
                )}
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
                  Fique de olho na sua caixa de entrada (e pasta de spam).<br />O QR Code será válido por 48 horas a partir do envio.
                </p>
              </div>
            )}

            {/* ERROR */}
            {step === 'error' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'rgba(255,58,58,0.1)', border: '1px solid rgba(255,58,58,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertCircle size={34} color="#ff3a3a" />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>Algo deu errado</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>{errMsg}</p>
                <button className="vc-btn" onClick={() => setStep('form')}>Tentar novamente</button>
              </div>
            )}

            {/* LOADING */}
            {step === 'loading' && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{
                  width: 44, height: 44, border: '3px solid rgba(76,158,255,0.2)',
                  borderTopColor: '#4c9eff', borderRadius: '50%',
                  animation: 'spin .8s linear infinite', margin: '0 auto 16px',
                }} />
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                  Registrando seu cadastro…
                </p>
              </div>
            )}

            {/* FORM */}
            {step === 'form' && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div>
                  <label className="vc-label">Nome completo *</label>
                  <div className="vc-input-wrap">
                    <User size={15} />
                    <input className="vc-input" value={form.nome_completo} onChange={e => set('nome_completo', e.target.value)} placeholder="Seu nome completo" required />
                  </div>
                </div>

                <div className="vc-row">
                  <div>
                    <label className="vc-label">CPF *</label>
                    <div className="vc-input-wrap">
                      <FileText size={15} />
                      <input className="vc-input" value={form.cpf} onChange={e => set('cpf', maskCpf(e.target.value))} placeholder="000.000.000-00" required />
                    </div>
                  </div>
                  <div>
                    <label className="vc-label">Telefone</label>
                    <div className="vc-input-wrap">
                      <Phone size={15} />
                      <input className="vc-input" value={form.telefone} onChange={e => set('telefone', maskPhone(e.target.value))} placeholder="(11) 99999-0000" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="vc-label">E-mail *</label>
                  <div className="vc-input-wrap">
                    <Mail size={15} />
                    <input className="vc-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" required />
                  </div>
                </div>

                <div>
                  <label className="vc-label">Empresa que vai visitar *</label>
                  <div className="vc-input-wrap">
                    <Building2 size={15} />
                    <select className="vc-input vc-select" value={form.empresa_id} onChange={e => set('empresa_id', e.target.value)} required>
                      <option value="">Selecione a empresa…</option>
                      {empresas.map(e => (
                        <option key={e.id} value={e.id} style={{ background: '#0d0d1a' }}>
                          {e.nome} — {e.andar}º andar, Sala {e.sala}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="vc-label">Motivo da visita *</label>
                  <div className="vc-input-wrap">
                    <FileText size={15} />
                    <input className="vc-input" value={form.motivo} onChange={e => set('motivo', e.target.value)} placeholder="Ex: Reunião comercial, entrevista…" required />
                  </div>
                </div>

                <div className="vc-row">
                  <div>
                    <label className="vc-label">Data da visita *</label>
                    <div className="vc-input-wrap">
                      <Calendar size={15} />
                      <input className="vc-input" type="date" value={form.data_visita} min={hoje} onChange={e => set('data_visita', e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="vc-label">Horário previsto *</label>
                    <div className="vc-input-wrap">
                      <Clock size={15} />
                      <input className="vc-input" type="time" value={form.hora_prevista} onChange={e => set('hora_prevista', e.target.value)} required />
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '10px 14px', background: 'rgba(76,158,255,0.06)',
                  border: '1px solid rgba(76,158,255,0.15)', borderRadius: 10,
                  fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6,
                }}>
                  Após a empresa aprovar seu acesso, você receberá um e-mail com seu QR Code pessoal. Apresente-o na recepção para registrar sua entrada e saída. Verifique também a pasta de spam.
                </div>

                <button className="vc-btn" type="submit">
                  Enviar solicitação de acesso <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
