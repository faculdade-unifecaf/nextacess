import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAdmin } from '../context/AdminContext';
import { UserPlus, Edit2, Power, Search, X, Check, GraduationCap, Mail, Phone, Calendar, Award, Briefcase, Hash } from 'lucide-react';
import type { Professor, TipoContrato } from '../data/mockData';

function ProfessorModal({
  onClose, onSave, initial,
}: {
  onClose: () => void;
  onSave: (data: Omit<Professor, 'id' | 'avatarColor'>) => void;
  initial?: Partial<Professor>;
}) {
  const [form, setForm] = useState({
    nome_completo: initial?.nome_completo || '',
    cpf: initial?.cpf || '',
    data_nascimento: initial?.data_nascimento || '',
    sexo: initial?.sexo || 'M' as Professor['sexo'],
    email: initial?.email || '',
    telefone: initial?.telefone || '',
    cref: initial?.cref || '',
    especialidade: initial?.especialidade || '',
    data_contratacao: initial?.data_contratacao || new Date().toISOString().slice(0, 10),
    tipo_contrato: initial?.tipo_contrato || 'CLT' as TipoContrato,
    status: initial?.status || 'Ativo' as Professor['status'],
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.nome_completo || !form.email) { alert('Nome e email são obrigatórios.'); return; }
    onSave(form as Omit<Professor, 'id' | 'avatarColor'>);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 570 }}>
        <div className="modal-header">
          <h3 className="modal-title">{initial?.nome_completo ? 'Editar Professor' : '➕ Novo Professor'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="form-row">
          <div className="form-group"><label>Nome Completo *</label><input value={form.nome_completo} onChange={e => set('nome_completo', e.target.value)} placeholder="Carlos Henrique" /></div>
          <div className="form-group"><label>CPF</label><input value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>E-mail *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="prof@nexus.com" /></div>
          <div className="form-group"><label>Telefone</label><input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(11) 99999-9999" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Data de Nascimento</label><input type="date" value={form.data_nascimento} onChange={e => set('data_nascimento', e.target.value)} /></div>
          <div className="form-group">
            <label>Sexo</label>
            <select value={form.sexo} onChange={e => set('sexo', e.target.value)}>
              <option value="M">Masculino</option><option value="F">Feminino</option><option value="Outro">Outro</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Especialidade</label><input value={form.especialidade} onChange={e => set('especialidade', e.target.value)} placeholder="Musculação e Hipertrofia" /></div>
          <div className="form-group"><label>CREF</label><input value={form.cref} onChange={e => set('cref', e.target.value)} placeholder="012345-G/SP" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Data de Contratação</label><input type="date" value={form.data_contratacao} onChange={e => set('data_contratacao', e.target.value)} /></div>
          <div className="form-group">
            <label>Tipo de Contrato</label>
            <select value={form.tipo_contrato} onChange={e => set('tipo_contrato', e.target.value as TipoContrato)}>
              <option value="CLT">CLT</option><option value="PJ">PJ</option><option value="Freelancer">Freelancer</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value as Professor['status'])}>
            <option value="Ativo">Ativo</option><option value="Inativo">Inativo</option>
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}><Check size={14} />Salvar Professor</button>
        </div>
      </div>
    </div>
  );
}

export default function Professores() {
  const { professores, usuarios, addProfessor, updateProfessor, toggleProfessorStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Professor | null>(null);

  const filtered = professores.filter(p =>
    p.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
    p.especialidade.toLowerCase().includes(search.toLowerCase()) ||
    p.cref.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data: Omit<Professor, 'id' | 'avatarColor'>) => {
    if (editing) { updateProfessor(editing.id, data); setEditing(null); }
    else addProfessor(data);
  };

  const contratoColor: Record<string, string> = { CLT: 'badge-green', PJ: 'badge-blue', Freelancer: 'badge-purple' };

  return (
    <Layout title="Professores" subtitle="Equipe de instrutores da academia">

      <div className="page-header">
        <div className="page-header-left">
          <h2>{professores.length} Professores</h2>
          <p>{professores.filter(p => p.status === 'Ativo').length} em exercício</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
          <UserPlus size={16} /> Novo Professor
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="search-wrapper">
          <Search size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, especialidade ou CREF..." />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 16 }}>
        {filtered.map(p => (
          <div key={p.id} className="card" style={{ borderColor: p.status === 'Inativo' ? 'var(--border)' : `${p.avatarColor}28` }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${p.avatarColor},transparent)`, borderRadius: '18px 18px 0 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div className="avatar avatar-lg" style={{ background: `${p.avatarColor}20`, color: p.avatarColor, borderRadius: 16, boxShadow: `0 0 16px ${p.avatarColor}30` }}>
                {p.nome_completo.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{p.nome_completo}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.especialidade}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <span className={`badge ${p.status === 'Ativo' ? 'badge-green' : 'badge-amber'}`}>{p.status}</span>
                  <span className={`badge ${contratoColor[p.tipo_contrato]}`}>{p.tipo_contrato}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(p); setModal(true); }}><Edit2 size={14} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => toggleProfessorStatus(p.id)}>
                  <Power size={14} color={p.status === 'Ativo' ? 'var(--green)' : 'var(--text-muted)'} />
                </button>
              </div>
            </div>

            <hr className="divider" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>

              <div style={{
                gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '8px 12px', overflow: 'hidden',
              }}>
                <Mail size={13} color={p.avatarColor} style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 1 }}>E-mail</div>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.email}>{p.email}</div>
                </div>
              </div>

              {[{ icon: Phone, label: 'Telefone', val: p.telefone },
              { icon: Award, label: 'CREF', val: p.cref },
              { icon: Calendar, label: 'Nascimento', val: p.data_nascimento },
              { icon: Briefcase, label: 'Contratado em', val: p.data_contratacao },
              { icon: Hash, label: 'CPF', val: p.cpf },
              { icon: UserPlus, label: 'Contrato', val: p.tipo_contrato },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '8px 10px', overflow: 'hidden',
                }}>
                  <Icon size={13} color={p.avatarColor} style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 1 }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={val}>{val}</div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <GraduationCap size={40} color="var(--text-muted)" />
          <h3>Nenhum professor encontrado</h3>
          <p>Tente outro termo de busca ou adicione um novo professor.</p>
        </div>
      )}

      {modal && (
        <ProfessorModal
          onClose={() => { setModal(false); setEditing(null); }}
          onSave={handleSave}
          initial={editing ?? undefined}
        />
      )}
    </Layout>
  );
}
