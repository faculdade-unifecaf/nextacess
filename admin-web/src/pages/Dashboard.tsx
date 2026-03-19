import React from 'react';
import Layout from '../components/Layout';
import { useAdmin } from '../context/AdminContext';
import {
  Users, GraduationCap, DollarSign, AlertTriangle,
  UserCheck, Activity, ArrowUpRight, Zap,
  ClipboardList, TrendingUp,
} from 'lucide-react';
import { receitaMensal } from '../data/mockData';

export default function Dashboard() {
  const { usuarios, professores, financeiro, planos, matriculas } = useAdmin();

  const totalUsuarios = usuarios.length;
  const ativos = usuarios.filter(u => u.status === 'Ativo').length;
  const bloqueados = usuarios.filter(u => u.status === 'Bloqueado').length;
  const totalProfs = professores.filter(p => p.status === 'Ativo').length;
  const receitaTotal = financeiro.filter(f => f.status === 'Pago').reduce((s, f) => s + f.valor, 0);
  const inadTotal = financeiro.filter(f => f.status === 'Inadimplente').reduce((s, f) => s + f.valor, 0);
  const matriculasAtivas = matriculas.filter(m => m.status === 'Ativa').length;

  const maxReceita = Math.max(...receitaMensal.map(r => r.valor));
  const planoColors = ['#4c9eff', '#22d35e', '#ffaa00', '#ff3a3a'];

  const planoStats = planos.map((pl, i) => ({
    nome: pl.nome, color: planoColors[i],
    count: matriculas.filter(m => m.plano_id === pl.id && m.status === 'Ativa').length,
  }));

  const stats = [
    { icon: Users, label: 'Usuários Cadastrados', value: totalUsuarios, color: '#4c9eff', sub: `${ativos} ativos`, trend: '+3 este mês', pos: true },
    { icon: ClipboardList, label: 'Matrículas Ativas', value: matriculasAtivas, color: '#22d35e', sub: 'planos vigentes', trend: '↑ boa retenção', pos: true },
    { icon: AlertTriangle, label: 'Bloqueados', value: bloqueados, color: '#ff3a3a', sub: 'acesso suspenso', trend: 'Requer ação', pos: false },
    { icon: GraduationCap, label: 'Professores Ativos', value: totalProfs, color: '#b06cff', sub: 'em exercício', trend: 'Equipe completa', pos: true },
    { icon: DollarSign, label: 'Receita Confirmada', value: `R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: '#22d35e', sub: 'pagamentos recebidos', trend: '+12% vs mês ant.', pos: true },
    { icon: TrendingUp, label: 'Inadimplência', value: `R$ ${inadTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: '#ffaa00', sub: 'em aberto', trend: 'Cobrar agora', pos: false },
  ];

  return (
    <Layout title="Dashboard" subtitle="Visão geral da academia em tempo real">

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ borderColor: `${s.color}22` }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, ${s.color}, transparent)`, borderRadius: '18px 18px 0 0'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-icon" style={{ background: `${s.color}18`, borderRadius: 14 }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700,
                color: s.pos ? 'var(--green)' : 'var(--red)',
                padding: '3px 8px', borderRadius: 20,
                background: s.pos ? 'rgba(34,211,94,0.08)' : 'rgba(255,58,58,0.08)'
              }}>
                {s.pos ? <ArrowUpRight size={10} /> : <AlertTriangle size={10} />}
                {s.trend}
              </div>
            </div>
            <div className="stat-value" style={{ color: s.color, marginTop: 14, fontSize: 30 }}>{s.value}</div>
            <div className="stat-label" style={{ marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 20, marginBottom: 24 }}>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ marginBottom: 2 }}>Receita Mensal</h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Últimos 7 meses</span>
            </div>
            <span className="badge badge-green"><Zap size={10} />+12% vs anterior</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
            {receitaMensal.map((r, i) => {
              const pct = (r.valor / maxReceita) * 100;
              const isLast = i === receitaMensal.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  {isLast && <div style={{ fontSize: 9, color: 'var(--green)', fontWeight: 800 }}>R$ {(r.valor / 1000).toFixed(1)}k</div>}
                  <div style={{
                    width: '100%', height: `${pct}%`, minHeight: 6,
                    background: isLast ? 'linear-gradient(180deg,#22d35e,#169446)' : 'linear-gradient(180deg,rgba(76,158,255,0.7),rgba(76,158,255,0.25))',
                    borderRadius: '6px 6px 2px 2px',
                    boxShadow: isLast ? '0 0 16px rgba(34,211,94,0.4)' : 'none',
                    position: 'relative',
                  }}>
                    {isLast && <div style={{ position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#22d35e', boxShadow: '0 0 10px rgba(34,211,94,0.8)' }} />}
                  </div>
                  <div style={{ fontSize: 10, color: isLast ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: isLast ? 700 : 400 }}>{r.mes}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Matrículas por Plano</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {planoStats.map((p, i) => {
              const pct = matriculasAtivas > 0 ? Math.round(p.count / matriculasAtivas * 100) : 0;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{p.nome}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: p.color }}>{pct}%</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>({p.count})</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${p.color},${p.color}66)` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="var(--blue)" />
            <h3>Usuários Recentes</h3>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>últimos {Math.min(6, usuarios.length)} de {usuarios.length}</span>
        </div>
        <div className="table-wrapper" style={{ border: 'none', background: 'transparent', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>CPF</th>
                <th>Matrícula</th>
                <th>Plano</th>
                <th>Vencimento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.slice(0, 6).map(u => {
                const mat = matriculas.find(m => m.usuario_id === u.id && m.status === 'Ativa') || matriculas.find(m => m.usuario_id === u.id);
                const plano = mat ? planos.find(p => p.id === mat.plano_id) : undefined;
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm" style={{ background: `${u.avatarColor}20`, color: u.avatarColor, boxShadow: `0 0 8px ${u.avatarColor}30` }}>
                          {u.nome_completo.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{u.nome_completo}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.cpf}</td>
                    <td><span className={`badge ${mat?.status === 'Ativa' ? 'badge-green' : mat?.status === 'Vencida' ? 'badge-red' : 'badge-amber'}`}>{mat?.status ?? '—'}</span></td>
                    <td style={{ fontSize: 13, fontWeight: 600 }}>{plano?.nome ?? '—'}</td>
                    <td style={{ fontSize: 12, color: mat?.status === 'Vencida' ? 'var(--red)' : 'var(--text-muted)', fontWeight: mat?.status === 'Vencida' ? 700 : 400 }}>{mat?.data_fim ?? '—'}</td>
                    <td><span className={`badge ${u.status === 'Ativo' ? 'badge-green' : u.status === 'Bloqueado' ? 'badge-red' : 'badge-amber'}`}>{u.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {bloqueados > 0 && (
        <div className="alert-banner error" style={{ marginTop: 20 }}>
          <AlertTriangle size={18} />
          <div><strong>{bloqueados} usuário(s) bloqueado(s).</strong> Veja em <strong>Usuários</strong> para gerenciar o acesso.</div>
        </div>
      )}
    </Layout>
  );
}
