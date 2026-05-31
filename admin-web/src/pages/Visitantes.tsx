import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAdmin } from '../context/AdminContext';
import { Plus, UserPlus, X, Check, Trash2, Edit2, Search, CheckCircle, XCircle, ClipboardList, Users, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { Visitante, StatusVisitante } from '../data/mockData';

const fmtCpf = (cpf: string) => {
  const c = (cpf ?? '').replace(/\D/g, '');
  if (c.length !== 11) return cpf;
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
};

const fmtDate = (d?: string) => {
  if (!d) return '—';
  const clean = d.split('T')[0]!;
  const [y, m, day] = clean.split('-');
  return `${day}/${m}/${y}`;
};

const fmtTime = (t?: string | null) => {
  if (!t) return null;
  if (t.includes('T')) return new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return t.slice(0, 5);
};

const fmtDateTime = (dt?: string) => {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const statusCfg: Record<StatusVisitante, { cls: string; label: string }> = {
  Aguardando: { cls: 'badge-amber',   label: 'Aguardando' },
  Aprovado:   { cls: 'badge-green',   label: 'Aprovado'   },
  'Em visita':{ cls: 'badge-blue',    label: 'Em visita'  },
  Saiu:       { cls: 'badge-neutral', label: 'Saiu'       },
  Negado:     { cls: 'badge-red',     label: 'Negado'     },
};

const tipoCfg: Record<string, { cls: string; label: string }> = {
  Entrada: { cls: 'badge-green',   label: 'Entrada' },
  Saída:   { cls: 'badge-neutral', label: 'Saída'   },
};

const acessoStatusCfg: Record<string, { cls: string }> = {
  Autorizado: { cls: 'badge-green' },
  Negado:     { cls: 'badge-red'   },
};

// ── Modal de cadastro/edição ──────────────────────────────────────────────────

function VisitanteModal({ onClose, onSave, initial, empresas, funcionarios }: {
  onClose: () => void;
  onSave: (data: Omit<Visitante, 'id' | 'data_cadastro'>) => Promise<void>;
  initial?: Partial<Visitante>;
  empresas: { id: string; nome: string }[];
  funcionarios: { id: string; nome_completo: string; empresa_id: string }[];
}) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [form, setForm] = useState({
    nome_completo:  initial?.nome_completo  || '',
    cpf:            initial?.cpf            || '',
    empresa_id:     initial?.empresa_id     || empresas[0]?.id || '',
    funcionario_id: initial?.funcionario_id || '',
    motivo:         initial?.motivo         || '',
    data_visita:    initial?.data_visita    || hoje,
    hora_prevista:  initial?.hora_prevista  || '09:00',
    hora_entrada:   initial?.hora_entrada   || '',
    hora_saida:     initial?.hora_saida     || '',
    status:         (initial?.status        || 'Aguardando') as StatusVisitante,
    autorizado_por: initial?.autorizado_por || '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const funcsEmpresa = funcionarios.filter(f => f.empresa_id === form.empresa_id);

  const handleSave = async () => {
    if (!form.nome_completo || !form.cpf || !form.empresa_id) {
      setErrMsg('Nome, CPF e empresa são obrigatórios.'); return;
    }
    setSaving(true);
    setErrMsg('');
    try {
      await onSave({ ...form, funcionario_id: form.funcionario_id || undefined });
      onClose();
    } catch (e: any) {
      setErrMsg(e?.response?.data?.error ?? e?.message ?? 'Erro ao salvar visitante.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <h3 className="modal-title">{initial?.nome_completo ? 'Editar Visitante' : 'Registrar Visitante'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        {errMsg && (
          <div style={{ margin: '0 0 14px', padding: '10px 14px', background: 'rgba(255,58,58,0.08)', border: '1px solid rgba(255,58,58,0.25)', borderRadius: 8, fontSize: 13, color: 'var(--red)' }}>
            {errMsg}
          </div>
        )}
        <div className="form-row">
          <div className="form-group"><label>Nome Completo *</label><input value={form.nome_completo} onChange={e => set('nome_completo', e.target.value)} placeholder="Nome do visitante" /></div>
          <div className="form-group"><label>CPF *</label><input value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" /></div>
        </div>
        <div className="form-group">
          <label>Empresa que vai visitar *</label>
          <select value={form.empresa_id} onChange={e => { set('empresa_id', e.target.value); set('funcionario_id', ''); }}>
            {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Usuário responsável</label>
          <select value={form.funcionario_id} onChange={e => set('funcionario_id', e.target.value)}>
            <option value="">Sem responsável específico</option>
            {funcsEmpresa.map(f => <option key={f.id} value={f.id}>{f.nome_completo}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Motivo da visita</label><input value={form.motivo} onChange={e => set('motivo', e.target.value)} placeholder="Ex: Reunião comercial" /></div>
        <div className="form-row">
          <div className="form-group"><label>Data da visita</label><input type="date" value={form.data_visita} onChange={e => set('data_visita', e.target.value)} /></div>
          <div className="form-group"><label>Hora prevista</label><input type="time" value={form.hora_prevista} onChange={e => set('hora_prevista', e.target.value)} /></div>
        </div>
        {initial?.nome_completo && (
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value as StatusVisitante)}>
              <option value="Aguardando">Aguardando</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Em visita">Em visita</option>
              <option value="Saiu">Saiu</option>
              <option value="Negado">Negado</option>
            </select>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Check size={14} />{saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Aba: Cadastros ────────────────────────────────────────────────────────────

function TabCadastros() {
  const { visitantes, empresas, funcionarios, addVisitante, updateVisitante, removeVisitante, aprovarVisitante, negarVisitante } = useAdmin();
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState<Visitante | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [search, setSearch]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = visitantes.filter(v => {
    const matchSearch = v.nome_completo.toLowerCase().includes(search.toLowerCase()) || (v.cpf ?? '').includes(search);
    const matchStatus = !filterStatus || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const aguardando = visitantes.filter(v => v.status === 'Aguardando').length;
  const emVisita   = visitantes.filter(v => v.status === 'Em visita').length;

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h2>{visitantes.length} visitantes registrados</h2>
          <p>{aguardando} aguardando · {emVisita} em visita</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'inherit' }}
          >
            <option value="">Todos os status</option>
            <option value="Aguardando">Aguardando</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Em visita">Em visita</option>
            <option value="Saiu">Saiu</option>
            <option value="Negado">Negado</option>
          </select>
          <div className="search-wrapper">
            <Search size={14} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar visitante..." />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
            <Plus size={16} /> Registrar Visitante
          </button>
        </div>
      </div>

      {aguardando > 0 && (
        <div className="alert-banner info" style={{ marginBottom: 20 }}>
          <UserPlus size={16} />
          <div><strong>{aguardando} visitante(s)</strong> aguardando aprovação pelo app mobile.</div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <UserPlus size={40} color="var(--text-muted)" />
          <h3>Nenhum visitante encontrado</h3>
          <p>Registre um novo visitante ou ajuste os filtros.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Visitante</th>
                <th>Empresa / Responsável</th>
                <th>Contato / Motivo</th>
                <th>Data / Hora</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const emp  = empresas.find(e => e.id === v.empresa_id);
                const func = funcionarios.find(f => f.id === v.funcionario_id);
                const cfg  = statusCfg[v.status];
                return (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{v.nome_completo}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtCpf(v.cpf)}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{emp?.nome ?? '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{func ? `Resp: ${func.nome_completo}` : 'Sem responsável'}</div>
                    </td>
                    <td>
                      {(v as any).email && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={(v as any).email}>
                          {(v as any).email}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{v.motivo}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtDate(v.data_visita)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {v.hora_entrada ? `Entrada: ${fmtTime(v.hora_entrada)}` : `Previsto: ${fmtTime(v.hora_prevista)}`}
                        {v.hora_saida ? ` · Saída: ${fmtTime(v.hora_saida)}` : ''}
                      </div>
                    </td>
                    <td><span className={`badge ${cfg.cls}`}>{cfg.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {v.status === 'Aguardando' && (
                          <>
                            <button className="btn btn-ghost btn-icon btn-sm" title="Aprovar" onClick={() => aprovarVisitante(v.id, 'Recepção')}>
                              <CheckCircle size={15} color="var(--green)" />
                            </button>
                            <button className="btn btn-ghost btn-icon btn-sm" title="Negar" onClick={() => negarVisitante(v.id)}>
                              <XCircle size={15} color="var(--red)" />
                            </button>
                          </>
                        )}
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(v); setModal(true); }}><Edit2 size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setConfirm(v.id)}><Trash2 size={14} color="var(--red)" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <VisitanteModal
          onClose={() => { setModal(false); setEditing(null); }}
          onSave={async data => {
            editing ? await updateVisitante(editing.id, data) : await addVisitante(data);
          }}
          initial={editing ?? undefined}
          empresas={empresas.filter(e => e.status === 'Ativa')}
          funcionarios={funcionarios.filter(f => f.status === 'Ativo')}
        />
      )}

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <h3 className="modal-title" style={{ marginBottom: 12 }}>Remover visitante</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>O registro será removido permanentemente.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { removeVisitante(confirm); setConfirm(null); }}><Trash2 size={14} /> Remover</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Aba: Logs ─────────────────────────────────────────────────────────────────

function TabLogs() {
  const { acessos } = useAdmin();
  const [search, setSearch]     = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterData, setFilterData] = useState('');

  const logs = acessos.filter(a =>
    (a.pessoa_tipo === 'visitante' || a.pessoa_tipo === 'Visitante')
  );

  const filtered = logs.filter(a => {
    const matchSearch = a.pessoa_nome.toLowerCase().includes(search.toLowerCase()) ||
      (a.empresa ?? '').toLowerCase().includes(search.toLowerCase());
    const matchTipo = !filterTipo || a.tipo === filterTipo;
    const matchData = !filterData || a.data_hora.startsWith(filterData);
    return matchSearch && matchTipo && matchData;
  });

  const hoje = new Date().toISOString().slice(0, 10);
  const entradasHoje = logs.filter(a => a.tipo === 'Entrada' && a.data_hora.startsWith(hoje)).length;
  const saidasHoje   = logs.filter(a => a.tipo === 'Saída'   && a.data_hora.startsWith(hoje)).length;

  return (
    <>
      {/* Cards de resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ borderColor: 'rgba(76,158,255,0.2)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #4c9eff, transparent)', borderRadius: '18px 18px 0 0' }} />
          <div className="stat-icon" style={{ background: 'rgba(76,158,255,0.12)', borderRadius: 14 }}><Users size={20} color="#4c9eff" /></div>
          <div className="stat-value" style={{ color: '#4c9eff', fontSize: 30 }}>{logs.length}</div>
          <div className="stat-label">Total de Registros</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>histórico completo</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(34,211,94,0.2)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #22d35e, transparent)', borderRadius: '18px 18px 0 0' }} />
          <div className="stat-icon" style={{ background: 'rgba(34,211,94,0.12)', borderRadius: 14 }}><ShieldCheck size={20} color="#22d35e" /></div>
          <div className="stat-value" style={{ color: '#22d35e', fontSize: 30 }}>{entradasHoje}</div>
          <div className="stat-label">Entradas Hoje</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>visitantes que entraram</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(148,163,184,0.2)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #94a3b8, transparent)', borderRadius: '18px 18px 0 0' }} />
          <div className="stat-icon" style={{ background: 'rgba(148,163,184,0.12)', borderRadius: 14 }}><ShieldAlert size={20} color="#94a3b8" /></div>
          <div className="stat-value" style={{ color: '#94a3b8', fontSize: 30 }}>{saidasHoje}</div>
          <div className="stat-label">Saídas Hoje</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>visitantes que saíram</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-header-left">
          <h2>{filtered.length} registros</h2>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="date" value={filterData} onChange={e => setFilterData(e.target.value)}
            style={{ width: 138, padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'inherit' }}
          />
          <select
            value={filterTipo} onChange={e => setFilterTipo(e.target.value)}
            style={{ width: 120, padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'inherit' }}
          >
            <option value="">Entrada/Saída</option>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
          </select>
          <div className="search-wrapper" style={{ maxWidth: 200 }}>
            <Search size={14} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar visitante..." />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={40} color="var(--text-muted)" />
          <h3>Nenhum registro encontrado</h3>
          <p>Os acessos de visitantes aparecerão aqui após passarem pela catraca.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Visitante</th>
                <th>Empresa</th>
                <th>Tipo</th>
                <th>Data / Hora</th>
                <th>Status</th>
                <th>Local</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const tipoCls   = tipoCfg[a.tipo]      ?? { cls: 'badge-neutral', label: a.tipo };
                const statusCls = acessoStatusCfg[a.status] ?? { cls: 'badge-neutral' };
                return (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{a.pessoa_nome}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.empresa ?? '—'}</td>
                    <td><span className={`badge ${tipoCls.cls}`}>{tipoCls.label}</span></td>
                    <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{fmtDateTime(a.data_hora)}</td>
                    <td><span className={`badge ${statusCls.cls}`}>{a.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.local ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ── Página principal com abas ─────────────────────────────────────────────────

type Tab = 'cadastros' | 'logs';

export default function Visitantes() {
  const [activeTab, setActiveTab] = useState<Tab>('cadastros');

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: '8px 20px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'inherit',
    transition: 'all .15s',
    background: activeTab === tab ? 'var(--accent)' : 'transparent',
    color: activeTab === tab ? '#fff' : 'var(--text-muted)',
  });

  return (
    <Layout title="Visitantes" subtitle="Cadastro e log de acessos de visitantes">
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 4, width: 'fit-content', border: '1px solid var(--border-light)' }}>
        <button style={tabStyle('cadastros')} onClick={() => setActiveTab('cadastros')}>
          <Users size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Visitantes
        </button>
        <button style={tabStyle('logs')} onClick={() => setActiveTab('logs')}>
          <ClipboardList size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Logs de Acesso
        </button>
      </div>

      {activeTab === 'cadastros' ? <TabCadastros /> : <TabLogs />}
    </Layout>
  );
}
