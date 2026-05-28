import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAdmin } from '../context/AdminContext';
import { Plus, UserPlus, X, Check, Trash2, Edit2, Search, CheckCircle, XCircle } from 'lucide-react';
import type { Visitante, StatusVisitante } from '../data/mockData';

const statusCfg: Record<StatusVisitante, { cls: string; label: string }> = {
  Aguardando: { cls: 'badge-amber', label: 'Aguardando' },
  Aprovado: { cls: 'badge-green', label: 'Aprovado' },
  'Em visita': { cls: 'badge-blue', label: 'Em visita' },
  Saiu: { cls: 'badge-neutral', label: 'Saiu' },
  Negado: { cls: 'badge-red', label: 'Negado' },
};

function VisitanteModal({ onClose, onSave, initial, empresas, funcionarios }: {
  onClose: () => void;
  onSave: (data: Omit<Visitante, 'id' | 'data_cadastro'>) => void;
  initial?: Partial<Visitante>;
  empresas: { id: string; nome: string }[];
  funcionarios: { id: string; nome_completo: string; empresa_id: string }[];
}) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    nome_completo: initial?.nome_completo || '',
    cpf: initial?.cpf || '',
    empresa_id: initial?.empresa_id || empresas[0]?.id || '',
    funcionario_id: initial?.funcionario_id || '',
    motivo: initial?.motivo || '',
    data_visita: initial?.data_visita || hoje,
    hora_prevista: initial?.hora_prevista || '09:00',
    hora_entrada: initial?.hora_entrada || '',
    hora_saida: initial?.hora_saida || '',
    status: (initial?.status || 'Aguardando') as StatusVisitante,
    autorizado_por: initial?.autorizado_por || '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const funcsEmpresa = funcionarios.filter(f => f.empresa_id === form.empresa_id);

  const handleSave = () => {
    if (!form.nome_completo || !form.cpf || !form.empresa_id) {
      alert('Nome, CPF e empresa são obrigatórios.');
      return;
    }
    onSave({ ...form, funcionario_id: form.funcionario_id || undefined });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <h3 className="modal-title">{initial?.nome_completo ? 'Editar Visitante' : 'Registrar Visitante'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
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
          <label>Funcionário responsável</label>
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
          <button className="btn btn-primary" onClick={handleSave}><Check size={14} />Salvar</button>
        </div>
      </div>
    </div>
  );
}

export default function Visitantes() {
  const { visitantes, empresas, funcionarios, addVisitante, updateVisitante, removeVisitante, aprovarVisitante, negarVisitante } = useAdmin();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Visitante | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = visitantes.filter(v => {
    const matchSearch = v.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
      v.cpf.includes(search);
    const matchStatus = !filterStatus || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const aguardando = visitantes.filter(v => v.status === 'Aguardando').length;
  const emVisita = visitantes.filter(v => v.status === 'Em visita').length;

  return (
    <Layout title="Visitantes" subtitle="Controle de acesso e autorização de visitantes">
      <div className="page-header">
        <div className="page-header-left">
          <h2>{visitantes.length} Visitantes registrados</h2>
          <p>{aguardando} aguardando · {emVisita} em visita</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ maxWidth: 180, padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'inherit' }}
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
          <div><strong>{aguardando} visitante(s)</strong> aguardando aprovação do administrador responsável.</div>
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
                <th>Motivo</th>
                <th>Data / Hora</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const emp = empresas.find(e => e.id === v.empresa_id);
                const func = funcionarios.find(f => f.id === v.funcionario_id);
                const cfg = statusCfg[v.status];
                return (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{v.nome_completo}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.cpf}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{emp?.nome ?? '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{func ? `Resp: ${func.nome_completo}` : 'Sem responsável'}</div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 200 }}>{v.motivo}</td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{v.data_visita}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {v.hora_entrada ? `Entrada: ${v.hora_entrada}` : `Previsto: ${v.hora_prevista}`}
                        {v.hora_saida ? ` · Saída: ${v.hora_saida}` : ''}
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
          onSave={data => { editing ? updateVisitante(editing.id, data) : addVisitante(data); }}
          initial={editing ?? undefined}
          empresas={empresas.filter(e => e.status === 'Ativa')}
          funcionarios={funcionarios.filter(f => f.status === 'Ativo')}
        />
      )}

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <h3 className="modal-title" style={{ marginBottom: 12 }}>Remover visitante</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>O registro de visita será removido permanentemente.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { removeVisitante(confirm); setConfirm(null); }}><Trash2 size={14} /> Remover</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
