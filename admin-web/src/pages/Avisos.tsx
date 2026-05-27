import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAdmin } from '../context/AdminContext';
import { Plus, Bell, X, Check, Trash2, Edit2 } from 'lucide-react';
import type { Aviso, TipoAviso, PrioridadeAviso, PublicoAviso } from '../data/mockData';

const tipoCfg: Record<TipoAviso, { cls: string; icon: string }> = {
  Informativo: { cls: 'badge-blue', icon: 'ℹ️' },
  Urgente: { cls: 'badge-red', icon: '🚨' },
  Comunicado: { cls: 'badge-purple', icon: '📣' },
};

const prioCfg: Record<PrioridadeAviso, { cls: string }> = {
  Baixa: { cls: 'badge-green' }, Média: { cls: 'badge-amber' }, Alta: { cls: 'badge-red' },
};

const publicoCfg: Record<PublicoAviso, { cls: string }> = {
  Funcionários: { cls: 'badge-blue' }, Visitantes: { cls: 'badge-amber' }, Todos: { cls: 'badge-green' },
};

function AvisoModal({ onClose, onSave, initial }: {
  onClose: () => void;
  onSave: (data: Omit<Aviso, 'id' | 'data_criacao'>) => void;
  initial?: Partial<Aviso>;
}) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    titulo: initial?.titulo || '',
    mensagem: initial?.mensagem || '',
    tipo: (initial?.tipo || 'Informativo') as TipoAviso,
    prioridade: (initial?.prioridade || 'Média') as PrioridadeAviso,
    publico: (initial?.publico || 'Todos') as PublicoAviso,
    data_inicio: initial?.data_inicio || hoje,
    data_expiracao: initial?.data_expiracao || '',
    ativo: initial?.ativo !== false,
  });
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.titulo || !form.mensagem) { alert('Título e mensagem são obrigatórios.'); return; }
    onSave(form as Omit<Aviso, 'id' | 'data_criacao'>);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3 className="modal-title">{initial?.titulo ? 'Editar Aviso' : 'Novo Aviso'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="form-group"><label>Título *</label><input value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ex: Manutenção dos elevadores" /></div>
        <div className="form-group"><label>Mensagem *</label><textarea value={form.mensagem} onChange={e => set('mensagem', e.target.value)} placeholder="Descreva o comunicado..." style={{ height: 100 }} /></div>
        <div className="form-row">
          <div className="form-group">
            <label>Tipo</label>
            <select value={form.tipo} onChange={e => set('tipo', e.target.value as TipoAviso)}>
              <option value="Informativo">ℹ️ Informativo</option>
              <option value="Urgente">🚨 Urgente</option>
              <option value="Comunicado">📣 Comunicado</option>
            </select>
          </div>
          <div className="form-group">
            <label>Prioridade</label>
            <select value={form.prioridade} onChange={e => set('prioridade', e.target.value as PrioridadeAviso)}>
              <option value="Baixa">🟢 Baixa</option>
              <option value="Média">🟡 Média</option>
              <option value="Alta">🔴 Alta</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Público-alvo</label>
          <select value={form.publico} onChange={e => set('publico', e.target.value as PublicoAviso)}>
            <option value="Todos">Todos</option>
            <option value="Funcionários">Funcionários</option>
            <option value="Visitantes">Visitantes</option>
          </select>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Início da exibição</label><input type="date" value={form.data_inicio} onChange={e => set('data_inicio', e.target.value)} /></div>
          <div className="form-group"><label>Expiração</label><input type="date" value={form.data_expiracao} onChange={e => set('data_expiracao', e.target.value)} /></div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.ativo ? 'ativo' : 'inativo'} onChange={e => set('ativo', e.target.value === 'ativo')}>
            <option value="ativo">Ativo</option><option value="inativo">Inativo</option>
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}><Check size={14} />Salvar Aviso</button>
        </div>
      </div>
    </div>
  );
}

export default function Avisos() {
  const { avisos, addAviso, updateAviso, removeAviso } = useAdmin();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Aviso | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const ativos = avisos.filter(a => a.ativo).length;
  const expirados = avisos.filter(a => a.data_expiracao && new Date(a.data_expiracao) < new Date()).length;

  return (
    <Layout title="Avisos" subtitle="Comunicados e informativos para usuários do prédio">
      <div className="page-header">
        <div className="page-header-left">
          <h2>{avisos.length} Avisos cadastrados</h2>
          <p>{ativos} ativos · {expirados} expirados</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
          <Plus size={16} /> Novo Aviso
        </button>
      </div>

      {avisos.length === 0 && (
        <div className="empty-state">
          <Bell size={40} color="var(--text-muted)" />
          <h3>Nenhum aviso criado</h3>
          <p>Crie comunicados para exibir aos usuários do prédio.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {avisos.map(a => {
          const tc = tipoCfg[a.tipo];
          const pc = prioCfg[a.prioridade];
          const pub = publicoCfg[a.publico];
          const expired = a.data_expiracao && new Date(a.data_expiracao) < new Date();
          return (
            <div key={a.id} className="card" style={{
              padding: '18px 22px',
              opacity: !a.ativo ? 0.6 : 1
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ fontSize: 22, marginTop: 2 }}>{tc.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{a.titulo}</span>
                    <span className={`badge ${tc.cls}`}>{a.tipo}</span>
                    <span className={`badge ${pc.cls}`}>{a.prioridade}</span>
                    <span className={`badge ${pub.cls}`}>{a.publico}</span>
                    {!a.ativo && <span className="badge badge-amber">Inativo</span>}
                    {expired && <span className="badge badge-red">Expirado</span>}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>{a.mensagem}</p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>📅 Criado: <strong style={{ color: 'var(--text-secondary)' }}>{a.data_criacao}</strong></span>
                    <span>▶ Início: <strong style={{ color: 'var(--text-secondary)' }}>{a.data_inicio}</strong></span>
                    {a.data_expiracao && <span>⏹ Expira: <strong style={{ color: expired ? 'var(--red)' : 'var(--text-secondary)' }}>{a.data_expiracao}</strong></span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(a); setModal(true); }}><Edit2 size={14} /></button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => updateAviso(a.id, { ativo: !a.ativo })} title={a.ativo ? 'Desativar' : 'Ativar'}>
                    {a.ativo
                      ? <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 700 }}>OFF</span>
                      : <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>ON</span>}
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setConfirm(a.id)}><Trash2 size={14} color="var(--red)" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <AvisoModal
          onClose={() => { setModal(false); setEditing(null); }}
          onSave={data => { editing ? updateAviso(editing.id, data) : addAviso(data); }}
          initial={editing ?? undefined}
        />
      )}

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <h3 className="modal-title" style={{ marginBottom: 12 }}>Remover aviso</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>O aviso será removido permanentemente.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { removeAviso(confirm); setConfirm(null); }}><Trash2 size={14} /> Remover</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
