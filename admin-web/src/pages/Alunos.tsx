import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAdmin } from '../context/AdminContext';
import { UserPlus, Search, Edit2, Power, Trash2, X, Check, ShieldOff, ClipboardList } from 'lucide-react';
import type { Usuario, StatusUsuario } from '../data/mockData';

function UsuarioModal({
  onClose, onSave, planos, initial,
}: {
  onClose: () => void;
  onSave: (data: Omit<Usuario, 'id' | 'avatarColor'>, planoId: string) => void;
  planos: { id: string; nome: string; valor: number; duracao_dias: number }[];
  initial?: Partial<Usuario & { planoId: string }>;
}) {
  const [form, setForm] = useState({
    nome_completo: initial?.nome_completo || '',
    cpf: initial?.cpf || '',
    data_nascimento: initial?.data_nascimento || '',
    sexo: initial?.sexo || 'M' as Usuario['sexo'],
    email: initial?.email || '',
    telefone: initial?.telefone || '',
    data_cadastro: initial?.data_cadastro || new Date().toISOString().slice(0, 10),
    status: initial?.status || 'Ativo' as StatusUsuario,
    planoId: initial?.planoId || '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.nome_completo || !form.email) { alert('Nome e e-mail são obrigatórios.'); return; }
    const { planoId, ...rest } = form;
    onSave(rest as Omit<Usuario, 'id' | 'avatarColor'>, planoId);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3 className="modal-title">{initial?.nome_completo ? 'Editar Usuário' : '➕ Novo Usuário'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="form-row">
          <div className="form-group"><label>Nome Completo *</label><input value={form.nome_completo} onChange={e => set('nome_completo', e.target.value)} placeholder="João da Silva" /></div>
          <div className="form-group"><label>CPF</label><input value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>E-mail *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="joao@email.com" /></div>
          <div className="form-group"><label>Telefone</label><input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(11) 99999-9999" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Data Nascimento</label><input type="date" value={form.data_nascimento} onChange={e => set('data_nascimento', e.target.value)} /></div>
          <div className="form-group">
            <label>Sexo</label>
            <select value={form.sexo} onChange={e => set('sexo', e.target.value)}>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Plano</label>
            <select value={form.planoId} onChange={e => set('planoId', e.target.value)}>
              <option value="">— Selecione —</option>
              {planos.map(p => <option key={p.id} value={p.id}>{p.nome} — R$ {p.valor.toFixed(2)} ({p.duracao_dias} dias)</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value as StatusUsuario)}>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Bloqueado">Bloqueado</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Data de Cadastro</label>
          <input type="date" value={form.data_cadastro} onChange={e => set('data_cadastro', e.target.value)} />
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}><Check size={14} />Salvar Usuário</button>
        </div>
      </div>
    </div>
  );
}

export default function Alunos() {
  const { usuarios, planos, matriculas, addUsuario, updateUsuario, removeUsuario, setStatusUsuario } = useAdmin();
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState<string>('todos');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const filtered = usuarios.filter(u => {
    const q = search.toLowerCase();
    const matchQ = u.nome_completo.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.cpf.includes(q);
    const matchF = filtro === 'todos' || u.status === filtro;
    return matchQ && matchF;
  });

  const handleSave = (data: Omit<Usuario, 'id' | 'avatarColor'>, planoId: string) => {
    if (editing) updateUsuario(editing.id, data);
    else addUsuario(data, planoId);
    setEditing(null);
  };

  const getMatricula = (uid: string) =>
    matriculas.find(m => m.usuario_id === uid && m.status === 'Ativa') || matriculas.find(m => m.usuario_id === uid);

  const getPlano = (uid: string) => {
    const mat = getMatricula(uid);
    return mat ? planos.find(p => p.id === mat.plano_id) : undefined;
  };

  return (
    <Layout title="Usuários" subtitle="Gerenciamento de usuários e matrículas">

      <div className="page-header">
        <div className="page-header-left">
          <h2>{usuarios.length} Usuários cadastrados</h2>
          <p>{usuarios.filter(u => u.status === 'Ativo').length} ativos · {usuarios.filter(u => u.status === 'Bloqueado').length} bloqueados</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
          <UserPlus size={16} /> Novo Usuário
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-wrapper" style={{ maxWidth: 280 }}>
          <Search size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, email ou CPF..." />
        </div>
        {(['todos', 'Ativo', 'Inativo', 'Bloqueado'] as const).map(s => (
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
              <th>CPF</th>
              <th>Contato</th>
              <th>Sexo</th>
              <th>Matrícula</th>
              <th>Plano</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Nenhum usuário encontrado</td></tr>
            )}
            {filtered.map(u => {
              const mat = getMatricula(u.id);
              const plano = getPlano(u.id);
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-md" style={{ background: `${u.avatarColor}20`, color: u.avatarColor, boxShadow: `0 0 8px ${u.avatarColor}25` }}>
                        {u.nome_completo.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{u.nome_completo}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.cpf}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.telefone}</td>
                  <td style={{ fontSize: 12 }}>{u.sexo === 'M' ? 'Masc.' : u.sexo === 'F' ? 'Fem.' : 'Outro'}</td>
                  <td><span className={`badge ${mat?.status === 'Ativa' ? 'badge-green' : mat?.status === 'Vencida' ? 'badge-red' : 'badge-amber'}`}>{mat?.status ?? '—'}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{plano?.nome ?? '—'}</div>
                    {plano && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>R$ {plano.valor.toFixed(2)}</div>}
                  </td>
                  <td style={{ fontSize: 12, color: mat?.status === 'Vencida' ? 'var(--red)' : 'var(--text-muted)', fontWeight: mat?.status === 'Vencida' ? 700 : 400 }}>
                    {mat?.data_fim ?? '—'}
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'Ativo' ? 'badge-green' : u.status === 'Bloqueado' ? 'badge-red' : 'badge-amber'}`}>{u.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Editar" onClick={() => { setEditing(u); setModal(true); }}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" title={u.status === 'Bloqueado' ? 'Desbloquear' : 'Bloquear'}
                        onClick={() => setStatusUsuario(u.id, u.status === 'Bloqueado' ? 'Ativo' : 'Bloqueado')}>
                        {u.status === 'Bloqueado'
                          ? <Power size={14} color="var(--text-muted)" />
                          : <ShieldOff size={14} color="var(--amber)" />}
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Ver matrícula">
                        <ClipboardList size={14} color="var(--blue)" />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Excluir" onClick={() => setConfirm(u.id)}>
                        <Trash2 size={14} color="var(--red)" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <UsuarioModal
          onClose={() => { setModal(false); setEditing(null); }}
          onSave={handleSave}
          planos={planos.filter(p => p.ativo)}
          initial={editing ?? undefined}
        />
      )}

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <h3 className="modal-title" style={{ marginBottom: 12 }}>Remover usuário</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Esta ação remove o usuário, sua matrícula e histórico financeiro permanentemente.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { removeUsuario(confirm); setConfirm(null); }}><Trash2 size={14} /> Remover</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
