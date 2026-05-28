import React from 'react';
import Layout from '../components/Layout';
import { useAdmin } from '../context/AdminContext';
import { Building2, Users, UserPlus, ShieldCheck, Bell, ShieldAlert, ArrowUpRight, AlertTriangle, Activity } from 'lucide-react';

const TIPO_PESSOA_CFG: Record<string, { cls: string; label: string }> = {
  admin:         { cls: 'badge-blue',    label: 'Administrador' },
  funcionario:   { cls: 'badge-neutral', label: 'Funcionário'   },
  visitante:     { cls: 'badge-amber',   label: 'Visitante'     },
  Administrador: { cls: 'badge-blue',    label: 'Administrador' },
  'Funcionário': { cls: 'badge-neutral', label: 'Funcionário'   },
  Visitante:     { cls: 'badge-amber',   label: 'Visitante'     },
};

export default function Dashboard() {
  const { empresas, funcionarios, visitantes, avisos, acessos } = useAdmin();

  const today = new Date().toISOString().slice(0, 10);

  const totalEmpresas  = empresas.filter(e => e.status === 'Ativa').length;
  const funcAtivos     = funcionarios.filter(f => f.status === 'Ativo').length;
  const visitantesHoje = visitantes.filter(v => v.data_visita === today).length;
  const aguardando     = visitantes.filter(v => v.status === 'Aguardando').length;
  const acessosHoje    = acessos.filter(a => a.data_hora.startsWith(today)).length;
  const avisosAtivos   = avisos.filter(a => a.ativo).length;
  const negadosHoje    = acessos.filter(a => a.data_hora.startsWith(today) && a.status === 'Negado').length;

  const stats = [
    { icon: Building2,  label: 'Empresas Ativas',   value: totalEmpresas,  color: '#4c9eff', sub: `${empresas.length} cadastradas`,      trend: 'No prédio',     pos: true },
    { icon: Users,      label: 'Funcionários Ativos', value: funcAtivos,    color: '#4c9eff', sub: `${funcionarios.length} total`,          trend: 'Credenciados',  pos: true },
    { icon: UserPlus,   label: 'Visitantes Hoje',    value: visitantesHoje, color: '#ffaa00', sub: `${aguardando} aguardando`,             trend: aguardando > 0 ? `${aguardando} pendente${aguardando > 1 ? 's' : ''}` : 'Nenhum pendente', pos: aguardando === 0 },
    { icon: ShieldCheck,label: 'Acessos Hoje',       value: acessosHoje,   color: '#4c9eff', sub: 'registros do dia',                     trend: 'Portaria ativa', pos: true },
    { icon: Bell,       label: 'Avisos Ativos',      value: avisosAtivos,  color: '#ffaa00', sub: 'comunicados vigentes',                 trend: 'Publicados',    pos: true },
    { icon: ShieldAlert,label: 'Acessos Negados',    value: negadosHoje,   color: '#ff3a3a', sub: 'hoje na portaria',                     trend: negadosHoje > 0 ? 'Requer atenção' : 'Tudo normal', pos: negadosHoje === 0 },
  ];

  return (
    <Layout title="Dashboard" subtitle="Visão geral do controle de acesso em tempo real">

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ borderColor: `${s.color}22` }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.color}, transparent)`, borderRadius: '18px 18px 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-icon" style={{ background: `${s.color}18`, borderRadius: 14 }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: s.pos ? 'var(--green)' : 'var(--red)', padding: '3px 8px', borderRadius: 20, background: s.pos ? 'rgba(34,211,94,0.08)' : 'rgba(255,58,58,0.08)' }}>
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

      {/* Últimos Acessos — ocupa largura total */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="var(--blue)" />
            <h3>Acessos Recentes</h3>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            últimos {Math.min(8, acessos.length)} de {acessos.length}
          </span>
        </div>
        {acessos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            Nenhum acesso registrado ainda.
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', background: 'transparent', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Tipo</th>
                  <th>Empresa / Andar</th>
                  <th>Movimento</th>
                  <th>Horário</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {acessos.slice(0, 8).map(a => {
                  const tipoCfg = TIPO_PESSOA_CFG[a.pessoa_tipo] ?? { cls: 'badge-neutral', label: a.pessoa_tipo };
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 700, fontSize: 13 }}>{a.pessoa_nome}</td>
                      <td><span className={`badge ${tipoCfg.cls}`}>{tipoCfg.label}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {a.empresa ?? '—'}{a.andar ? ` · ${a.andar}º andar` : ''}
                      </td>
                      <td><span className={`badge ${a.tipo === 'Entrada' ? 'badge-green' : 'badge-amber'}`}>{a.tipo}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(a.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td><span className={`badge ${a.status === 'Autorizado' ? 'badge-green' : 'badge-red'}`}>{a.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {aguardando > 0 && (
        <div className="alert-banner info">
          <UserPlus size={18} />
          <div><strong>{aguardando} visitante(s) aguardando aprovação.</strong> Acesse <strong>Visitantes</strong> para autorizar ou negar o acesso.</div>
        </div>
      )}
    </Layout>
  );
}
