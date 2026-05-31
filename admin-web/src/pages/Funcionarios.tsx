import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAdmin } from '../context/AdminContext';
import { Plus, Users, X, Check, Trash2, Edit2, Search, ShieldCheck } from 'lucide-react';
import type { Funcionario, StatusFuncionario, RoleFuncionario } from '../data/mockData';

const fmtCpf = (cpf: string) => {
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11) return cpf;
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
};

function FuncionarioModal({ onClose, onSave, initial, empresas }: {
  onClose: () => void;
  onSave: (data: Omit<Funcionario, 'id' | 'avatarColor'>) => void;
  initial?: Partial<Funcionario>;
  empresas: { id: string; nome: string }[];
}) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    nome_completo: initial?.nome_completo || '',
    cpf: initial?.cpf || '',
    email: initial?.email || '',
    telefone: initial?.telefone || '',
    empresa_id: initial?.empresa_id || empresas[0]?.id || '',
    role: (initial?.role || 'funcionario') as RoleFuncionario,
    status: (initial?.status || 'Ativo') as StatusFuncionario,
    data_cadastro: initial?.data_cadastro || hoje,
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.nome_completo || !form.cpf || !form.email || !form.empresa_id) {
      alert('Nome, CPF, e-mail e empresa são obrigatórios.');
      return;
    }
    onSave(form as Omit<Funcionario, 'id' | 'avatarColor'>);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <h3 className="modal-title">{initial?.nome_completo ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Nome Completo *</label><input value={form.nome_completo} onChange={e => set('nome_completo', e.target.value)} placeholder="Nome completo" /></div>
          <div className="form-group"><label>CPF *</label><input value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>E-mail *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="funcionario@empresa.com" /></div>
          <div className="form-group"><label>Telefone</label><input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(11) 00000-0000" /></div>
        </div>
        <div className="form-group">
          <label>Empresa *</label>
          <select value={form.empresa_id} onChange={e => set('empresa_id', e.target.value)}>
            {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Perfil de acesso</label>
          <select value={form.role} onChange={e => set('role', e.target.value as RoleFuncionario)}>
            <option value="funcionario">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        {initial?.nome_completo && (
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value as StatusFuncionario)}>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Bloqueado">Bloqueado</option>
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

export default function Funcionarios() {
  const { funcionarios, empresas, addFuncionario, updateFuncionario, removeFuncionario, setStatusFuncionario } = useAdmin();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Funcionario | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');

  const filtered = funcionarios.filter(f => {
    const emp = empresas.find(e => e.id === f.empresa_id);
    const matchSearch = f.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
      f.cpf.includes(search) || f.email.toLowerCase().includes(search.toLowerCase());
    const matchEmpresa = !filterEmpresa || f.empresa_id === filterEmpresa;
    return matchSearch && matchEmpresa;
  });

  const ativos = funcionarios.filter(f => f.status === 'Ativo').length;
  const admins = funcionarios.filter(f => f.role === 'admin').length;

  return (
    <Layout title="Usuários" subtitle="Gerenciamento de usuários credenciados">
      <div className="page-header">
        <div className="page-header-left">
          <h2>{funcionarios.length} Usuários cadastrados</h2>
          <p>{ativos} ativos · {admins} administradores</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            value={filterEmpresa} onChange={e => setFilterEmpresa(e.target.value)}
            style={{ maxWidth: 200, padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'inherit' }}
          >
            <option value="">Todas as empresas</option>
            {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
          <div className="search-wrapper">
            <Search size={14} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuário..." />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
            <Plus size={16} /> Novo Usuário
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={40} color="var(--text-muted)" />
          <h3>Nenhum usuário encontrado</h3>
          <p>Cadastre um novo usuário ou ajuste os filtros.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>CPF</th>
                <th>Empresa</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const emp = empresas.find(e => e.id === f.empresa_id);
                return (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm" style={{ background: `${f.avatarColor}20`, color: f.avatarColor, boxShadow: `0 0 8px ${f.avatarColor}30` }}>
                          {f.nome_completo.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{f.nome_completo}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtCpf(f.cpf)}</td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{emp?.nome ?? '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp ? `${emp.andar}º andar · Sala ${emp.sala}` : ''}</div>
                    </td>
                    <td>
                      <span className={`badge ${f.role === 'admin' ? 'badge-blue' : 'badge-neutral'}`}>
                        {f.role === 'admin' ? <><ShieldCheck size={10} /> Admin</> : 'Usuário'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${f.status === 'Ativo' ? 'badge-green' : f.status === 'Bloqueado' ? 'badge-red' : 'badge-amber'}`}>
                        {f.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(f); setModal(true); }}><Edit2 size={14} /></button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setStatusFuncionario(f.id, f.status === 'Bloqueado' ? 'Ativo' : 'Bloqueado')}
                          title={f.status === 'Bloqueado' ? 'Desbloquear' : 'Bloquear'}
                        >
                          <span style={{ fontSize: 10, fontWeight: 700, color: f.status === 'Bloqueado' ? 'var(--green)' : 'var(--amber)' }}>
                            {f.status === 'Bloqueado' ? 'ON' : 'OFF'}
                          </span>
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setConfirm(f.id)}><Trash2 size={14} color="var(--red)" /></button>
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
        <FuncionarioModal
          onClose={() => { setModal(false); setEditing(null); }}
          onSave={async data => {
            try {
              editing ? await updateFuncionario(editing.id, data) : await addFuncionario(data);
              setModal(false);
              setEditing(null);
            } catch (e: any) {
              alert(e?.response?.data?.error ?? 'Erro ao salvar usuário');
            }
          }}
          initial={editing ?? undefined}
          empresas={empresas.filter(e => e.status === 'Ativa')}
        />
      )}

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <h3 className="modal-title" style={{ marginBottom: 12 }}>Remover usuário</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>O usuário será removido e perderá o acesso ao sistema.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { removeFuncionario(confirm); setConfirm(null); }}><Trash2 size={14} /> Remover</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
