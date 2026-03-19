import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAdmin } from '../context/AdminContext';
import { Plus, Edit2, Trash2, X, Check, CreditCard } from 'lucide-react';
import type { Plano } from '../data/mockData';

function PlanoModal({
  onClose, onSave, initial,
}: {
  onClose: () => void;
  onSave: (data: Omit<Plano, 'id'>) => void;
  initial?: Partial<Plano>;
}) {
  const [form, setForm] = useState({
    nome: initial?.nome || '',
    valor: String(initial?.valor ?? ''),
    duracao_dias: String(initial?.duracao_dias ?? '30'),
    descricao: initial?.descricao || '',
    ativo: initial?.ativo !== false,
  });
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.nome || !form.valor) { alert('Nome e valor são obrigatórios.'); return; }
    onSave({ nome: form.nome, valor: parseFloat(form.valor), duracao_dias: parseInt(form.duracao_dias) || 30, descricao: form.descricao, ativo: form.ativo });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3 className="modal-title">{initial?.nome ? 'Editar Plano' : '➕ Novo Plano'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Nome do plano *</label><input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Mensal, Anual..." /></div>
          <div className="form-group"><label>Valor (R$) *</label><input type="number" value={form.valor} onChange={e => set('valor', e.target.value)} placeholder="99.90" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Duração (dias) *</label><input type="number" value={form.duracao_dias} onChange={e => set('duracao_dias', e.target.value)} placeholder="30" /></div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.ativo ? 'ativo' : 'inativo'} onChange={e => set('ativo', e.target.value === 'ativo')}>
              <option value="ativo">Ativo</option><option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label>Descrição</label><textarea value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Descreva os benefícios do plano..." style={{ height: 80 }} /></div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}><Check size={14} />Salvar Plano</button>
        </div>
      </div>
    </div>
  );
}

export default function Planos() {
  const { planos, matriculas, addPlano, updatePlano, removePlano } = useAdmin();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Plano | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const colors = ['#4c9eff', '#22d35e', '#ffaa00', '#ff3a3a', '#b06cff', '#ec4899'];
  const totalMatriculas = matriculas.filter(m => m.status === 'Ativa').length;

  return (
    <Layout title="Planos" subtitle="Criação e gerenciamento de planos de acesso">

      <div className="page-header">
        <div className="page-header-left">
          <h2>{planos.length} Planos cadastrados</h2>
          <p>{planos.filter(p => p.ativo).length} ativos comercialmente</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
          <Plus size={16} /> Novo Plano
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {planos.map((p, i) => {
          const cor = colors[i % colors.length];
          const cnt = matriculas.filter(m => m.plano_id === p.id && m.status === 'Ativa').length;
          const pct = totalMatriculas > 0 ? Math.round(cnt / totalMatriculas * 100) : 0;
          return (
            <div key={p.id} className="card" style={{ borderColor: `${cor}28` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${cor},${cor}55)`, borderRadius: '18px 18px 0 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CreditCard size={16} color={cor} />
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: cor }}>{p.nome}</span>
                </div>
                <span className={`badge ${p.ativo ? 'badge-green' : 'badge-amber'}`}>{p.ativo ? 'Ativo' : 'Inativo'}</span>
              </div>

              <div style={{ fontSize: 32, fontWeight: 900, color: cor, letterSpacing: '-1px', marginBottom: 4 }}>
                R$ {p.valor.toFixed(2).replace('.', ',')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                {p.descricao || `Acesso completo por ${p.duracao_dias} dias`}
              </div>

              <div style={{ padding: '10px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Matrículas ativas</span>
                  <span style={{ fontWeight: 800, fontSize: 20, color: cor }}>{cnt}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${cor},${cor}66)` }} />
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                ⏱ Duração: <strong style={{ color: 'var(--text-secondary)' }}>{p.duracao_dias} dias</strong>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => { setEditing(p); setModal(true); }}>
                  <Edit2 size={12} /> Editar
                </button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--red)', borderColor: 'rgba(255,58,58,0.2)' }} onClick={() => setConfirm(p.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <PlanoModal
          onClose={() => { setModal(false); setEditing(null); }}
          onSave={data => { editing ? updatePlano(editing.id, data) : addPlano(data); }}
          initial={editing ?? undefined}
        />
      )}

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <h3 className="modal-title" style={{ marginBottom: 12 }}>Remover plano</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              As matrículas existentes não serão afetadas. Apenas o plano será removido do catálogo.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { removePlano(confirm); setConfirm(null); }}>
                <Trash2 size={14} /> Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
