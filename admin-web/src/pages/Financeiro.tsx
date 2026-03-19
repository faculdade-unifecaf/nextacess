import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAdmin } from '../context/AdminContext';
import { Search, AlertTriangle, CheckCircle, Clock, Ban } from 'lucide-react';
import type { StatusFinanceiro } from '../data/mockData';

const statusCfg: Record<StatusFinanceiro, { cls: string; label: string }> = {
  Pago: { cls: 'badge-green', label: 'Pago' },
  Pendente: { cls: 'badge-amber', label: 'Pendente' },
  Vencido: { cls: 'badge-red', label: 'Vencido' },
  Inadimplente: { cls: 'badge-red', label: 'Inadimplente' },
};

const metodoIcon: Record<string, string> = { PIX: '⚡', Cartão: '💳', Boleto: '📄', Dinheiro: '💵' };

export default function Financeiro() {
  const { financeiro, usuarios, planos, matriculas } = useAdmin();
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState<string>('todos');

  const totalPago = financeiro.filter(f => f.status === 'Pago').reduce((s, f) => s + f.valor, 0);
  const totalPend = financeiro.filter(f => f.status === 'Pendente').reduce((s, f) => s + f.valor, 0);
  const totalInad = financeiro.filter(f => ['Vencido', 'Inadimplente'].includes(f.status)).reduce((s, f) => s + f.valor, 0);
  const qtdInad = financeiro.filter(f => ['Inadimplente', 'Vencido'].includes(f.status)).length;

  const filtered = financeiro.filter(f => {
    const usuario = usuarios.find(u => u.id === f.usuario_id);
    const mat = matriculas.find(m => m.id === f.matricula_id);
    const plano = mat ? planos.find(p => p.id === mat.plano_id) : undefined;
    const q = search.toLowerCase();
    const matchQ = (usuario?.nome_completo || '').toLowerCase().includes(q)
      || (plano?.nome || '').toLowerCase().includes(q)
      || (usuario?.cpf || '').includes(q);
    const matchF = filtro === 'todos' || f.status === filtro;
    return matchQ && matchF;
  });

  const fmtR = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const kpis = [
    { icon: CheckCircle, label: 'Total Recebido', val: fmtR(totalPago), color: '#22d35e', bg: 'rgba(34,211,94,0.1)' },
    { icon: Clock, label: 'A Receber', val: fmtR(totalPend), color: '#ffaa00', bg: 'rgba(255,170,0,0.1)' },
    { icon: Ban, label: 'Inadim./Vencido', val: fmtR(totalInad), color: '#ff3a3a', bg: 'rgba(255,58,58,0.1)' },
    { icon: AlertTriangle, label: 'Em aberto', val: `${qtdInad} cobranças`, color: '#ff3a3a', bg: 'rgba(255,58,58,0.1)' },
  ];

  return (
    <Layout title="Financeiro" subtitle="Controle de receitas, cobranças e inadimplência">

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {kpis.map((k, i) => (
          <div key={i} className="stat-card" style={{ borderColor: `${k.color}22` }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${k.color},transparent)`, borderRadius: '18px 18px 0 0' }} />
            <div className="stat-icon" style={{ background: k.bg, borderRadius: 12, marginBottom: 12 }}>
              <k.icon size={18} color={k.color} />
            </div>
            <div className="stat-value" style={{ color: k.color, fontSize: 22 }}>{k.val}</div>
            <div className="stat-label" style={{ marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-wrapper" style={{ maxWidth: 300 }}>
          <Search size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, CPF ou plano..." />
        </div>
        {(['todos', 'Pago', 'Pendente', 'Vencido', 'Inadimplente'] as const).map(s => (
          <button key={s} className={`btn btn-sm ${filtro === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltro(s)}>
            {s === 'todos' ? 'Todos' : s}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Matrícula</th>
              <th>Plano</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Pagamento</th>
              <th>Método</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Nenhum registro encontrado</td></tr>
            )}
            {filtered.map(f => {
              const usuario = usuarios.find(u => u.id === f.usuario_id);
              const mat = matriculas.find(m => m.id === f.matricula_id);
              const plano = mat ? planos.find(p => p.id === mat.plano_id) : undefined;
              const cfg = statusCfg[f.status];
              return (
                <tr key={f.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {usuario && (
                        <div className="avatar avatar-sm" style={{ background: `${usuario.avatarColor}20`, color: usuario.avatarColor }}>
                          {usuario.nome_completo.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{usuario?.nome_completo ?? '—'}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{usuario?.cpf}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{mat?.id.slice(0, 6).toUpperCase() ?? '—'}</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{plano?.nome ?? '—'}</td>
                  <td style={{ fontWeight: 800 }}>{fmtR(f.valor)}</td>
                  <td style={{ fontSize: 12, color: ['Vencido', 'Inadimplente'].includes(f.status) ? 'var(--red)' : 'var(--text-muted)', fontWeight: ['Vencido', 'Inadimplente'].includes(f.status) ? 700 : 400 }}>
                    {f.data_vencimento}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.data_pagamento ?? '—'}</td>
                  <td style={{ fontSize: 13 }}>{f.metodo_pagamento ? `${metodoIcon[f.metodo_pagamento]} ${f.metodo_pagamento}` : '—'}</td>
                  <td><span className={`badge ${cfg.cls}`}>{cfg.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {qtdInad > 0 && (
        <div className="alert-banner error" style={{ marginTop: 20 }}>
          <AlertTriangle size={18} />
          <div>
            <strong>{qtdInad} cobrança(s) vencida(s) ou inadimplentes</strong> — total de <strong>{fmtR(totalInad)}</strong> em aberto.
            Vá em <strong>Alertas</strong> para enviar cobranças.
          </div>
        </div>
      )}
    </Layout>
  );
}
