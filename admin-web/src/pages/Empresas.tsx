import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAdmin } from '../context/AdminContext';
import { Plus, Building2, X, Check, Trash2, Edit2, Search } from 'lucide-react';
import type { Empresa, StatusEmpresa } from '../data/mockData';

function EmpresaModal({ onClose, onSave, initial }: {
  onClose: () => void;
  onSave: (data: Omit<Empresa, 'id' | 'avatarColor'>) => void;
  initial?: Partial<Empresa>;
}) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    nome: initial?.nome || '',
    cnpj: initial?.cnpj || '',
    andar: initial?.andar || 1,
    sala: initial?.sala || '',
    responsavel: initial?.responsavel || '',
    email: initial?.email || '',
    telefone: initial?.telefone || '',
    data_cadastro: initial?.data_cadastro || hoje,
    status: (initial?.status || 'Ativa') as StatusEmpresa,
  });
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.nome || !form.cnpj) { alert('Nome e CNPJ são obrigatórios.'); return; }
    onSave(form as Omit<Empresa, 'id' | 'avatarColor'>);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3 className="modal-title">{initial?.nome ? 'Editar Empresa' : 'Nova Empresa'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Nome da Empresa *</label><input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: TechVision Soluções" /></div>
          <div className="form-group"><label>CNPJ *</label><input value={form.cnpj} onChange={e => set('cnpj', e.target.value)} placeholder="00.000.000/0001-00" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Andar</label><input type="number" min={1} max={50} value={form.andar} onChange={e => set('andar', parseInt(e.target.value) || 1)} /></div>
          <div className="form-group"><label>Sala</label><input value={form.sala} onChange={e => set('sala', e.target.value)} placeholder="Ex: 301" /></div>
        </div>
        <div className="form-group"><label>Responsável</label><input value={form.responsavel} onChange={e => set('responsavel', e.target.value)} placeholder="Nome do responsável" /></div>
        <div className="form-row">
          <div className="form-group"><label>E-mail</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contato@empresa.com" /></div>
          <div className="form-group"><label>Telefone</label><input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(11) 0000-0000" /></div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value as StatusEmpresa)}>
            <option value="Ativa">Ativa</option>
            <option value="Inativa">Inativa</option>
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}><Check size={14} />Salvar</button>
        </div>
      </div>
    </div>
  );
}

export default function Empresas() {
  const { empresas, addEmpresa, updateEmpresa, removeEmpresa } = useAdmin();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Empresa | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = empresas.filter(e =>
    e.nome.toLowerCase().includes(search.toLowerCase()) ||
    e.cnpj.includes(search) ||
    e.responsavel.toLowerCase().includes(search.toLowerCase())
  );

  const ativas = empresas.filter(e => e.status === 'Ativa').length;

  return (
    <Layout title="Empresas" subtitle="Gerenciamento de empresas e locatários do prédio">
      <div className="page-header">
        <div className="page-header-left">
          <h2>{empresas.length} Empresas cadastradas</h2>
          <p>{ativas} ativas · {empresas.length - ativas} inativas</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="search-wrapper">
            <Search size={14} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar empresa..." />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
            <Plus size={16} /> Nova Empresa
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Building2 size={40} color="var(--text-muted)" />
          <h3>Nenhuma empresa encontrada</h3>
          <p>Cadastre uma nova empresa ou ajuste a busca.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>CNPJ</th>
                <th>Andar / Sala</th>
                <th>Responsável</th>
                <th>Contato</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm" style={{ background: `${e.avatarColor}20`, color: e.avatarColor, boxShadow: `0 0 8px ${e.avatarColor}30`, flexShrink: 0 }}>
                        {e.nome.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{e.nome}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>desde {e.data_cadastro}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.cnpj}</td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{e.andar}º andar</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>· Sala {e.sala}</span>
                  </td>
                  <td style={{ fontSize: 13 }}>{e.responsavel}</td>
                  <td>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{e.email}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.telefone}</div>
                  </td>
                  <td>
                    <span className={`badge ${e.status === 'Ativa' ? 'badge-green' : 'badge-amber'}`}>{e.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(e); setModal(true); }}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setConfirm(e.id)}><Trash2 size={14} color="var(--red)" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <EmpresaModal
          onClose={() => { setModal(false); setEditing(null); }}
          onSave={data => { editing ? updateEmpresa(editing.id, data) : addEmpresa(data); }}
          initial={editing ?? undefined}
        />
      )}

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <h3 className="modal-title" style={{ marginBottom: 12 }}>Remover empresa</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Esta ação é irreversível. A empresa será removida do sistema.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { removeEmpresa(confirm); setConfirm(null); }}><Trash2 size={14} /> Remover</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
