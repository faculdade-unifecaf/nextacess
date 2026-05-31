import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAdmin } from '../context/AdminContext';
import { ShieldCheck, ShieldAlert, TrendingUp, Search } from 'lucide-react';
import type { TipoAcesso, StatusAcesso, TipoPessoa } from '../data/mockData';

// O back-end grava o role direto ('admin', 'funcionario', 'visitante')
// e às vezes o valor capitalizado — cobrimos os dois formatos
const tipoPessoaCfg: Record<string, { cls: string; label: string }> = {
  admin:          { cls: 'badge-blue',    label: 'Administrador' },
  funcionario:    { cls: 'badge-neutral', label: 'Usuário'       },
  visitante:      { cls: 'badge-amber',   label: 'Visitante'     },
  Administrador:  { cls: 'badge-blue',    label: 'Administrador' },
  'Funcionário':  { cls: 'badge-neutral', label: 'Usuário'       },
  Visitante:      { cls: 'badge-amber',   label: 'Visitante'     },
};

export default function Acessos() {
  const { acessos } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<TipoAcesso | ''>('');
  const [filterStatus, setFilterStatus] = useState<StatusAcesso | ''>('');
  const [filterData, setFilterData] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const filtered = acessos.filter(a => {
    const matchSearch = a.pessoa_nome.toLowerCase().includes(search.toLowerCase()) ||
      (a.empresa ?? '').toLowerCase().includes(search.toLowerCase());
    const matchTipo = !filterTipo || a.tipo === filterTipo;
    const matchStatus = !filterStatus || a.status === filterStatus;
    const matchData = !filterData || a.data_hora.startsWith(filterData);
    return matchSearch && matchTipo && matchStatus && matchData;
  });

  const totalHoje = acessos.filter(a => a.data_hora.startsWith(today)).length;
  const autorizadosHoje = acessos.filter(a => a.data_hora.startsWith(today) && a.status === 'Autorizado').length;
  const negadosHoje = acessos.filter(a => a.data_hora.startsWith(today) && a.status === 'Negado').length;

  return (
    <Layout title="Acessos" subtitle="Log de acessos e auditoria de entrada e saída">

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ borderColor: 'rgba(76,158,255,0.2)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #4c9eff, transparent)', borderRadius: '18px 18px 0 0' }} />
          <div className="stat-icon" style={{ background: 'rgba(76,158,255,0.12)', borderRadius: 14 }}>
            <TrendingUp size={20} color="#4c9eff" />
          </div>
          <div className="stat-value" style={{ color: '#4c9eff', fontSize: 30 }}>{totalHoje}</div>
          <div className="stat-label">Acessos Hoje</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>total do dia</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(34,211,94,0.2)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #22d35e, transparent)', borderRadius: '18px 18px 0 0' }} />
          <div className="stat-icon" style={{ background: 'rgba(34,211,94,0.12)', borderRadius: 14 }}>
            <ShieldCheck size={20} color="#22d35e" />
          </div>
          <div className="stat-value" style={{ color: '#22d35e', fontSize: 30 }}>{autorizadosHoje}</div>
          <div className="stat-label">Autorizados</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>acessos liberados</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(255,58,58,0.2)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #ff3a3a, transparent)', borderRadius: '18px 18px 0 0' }} />
          <div className="stat-icon" style={{ background: 'rgba(255,58,58,0.12)', borderRadius: 14 }}>
            <ShieldAlert size={20} color="#ff3a3a" />
          </div>
          <div className="stat-value" style={{ color: '#ff3a3a', fontSize: 30 }}>{negadosHoje}</div>
          <div className="stat-label">Negados</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>acessos bloqueados</div>
        </div>
      </div>

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-header-left">
          <h2>{filtered.length} de {acessos.length} registros</h2>
          <p>{totalHoje} acessos hoje · {autorizadosHoje} autorizados · {negadosHoje} negados</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="search-wrapper" style={{ maxWidth: 200 }}>
            <Search size={14} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." />
          </div>
          <input
            type="date" value={filterData} onChange={e => setFilterData(e.target.value)}
            style={{ width: 138, padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'inherit' }}
          />
          <select
            value={filterTipo} onChange={e => setFilterTipo(e.target.value as TipoAcesso | '')}
            style={{ width: 130, padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'inherit' }}
          >
            <option value="">Entrada e Saída</option>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
          </select>
          <select
            value={filterStatus} onChange={e => setFilterStatus(e.target.value as StatusAcesso | '')}
            style={{ width: 140, padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'inherit' }}
          >
            <option value="">Todos os status</option>
            <option value="Autorizado">Autorizado</option>
            <option value="Negado">Negado</option>
          </select>
          {(search || filterTipo || filterStatus || filterData) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterTipo(''); setFilterStatus(''); setFilterData(''); }}>
              Limpar
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <ShieldCheck size={40} color="var(--text-muted)" />
          <h3>Nenhum acesso encontrado</h3>
          <p>Ajuste os filtros para ver registros de acesso.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Pessoa</th>
                <th>Tipo</th>
                <th>Empresa / Andar</th>
                <th>Movimento</th>
                <th>Local</th>
                <th>Data / Hora</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const tipoCfg = tipoPessoaCfg[a.pessoa_tipo];
                return (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{a.pessoa_nome}</div>
                      {a.observacao && (
                        <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 2 }}>{a.observacao}</div>
                      )}
                    </td>
                    <td><span className={`badge ${tipoCfg?.cls ?? 'badge-neutral'}`}>{tipoCfg?.label ?? a.pessoa_tipo}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {a.empresa ?? '—'}{a.andar ? ` · ${a.andar}º andar` : ''}
                    </td>
                    <td>
                      <span className={`badge ${a.tipo === 'Entrada' ? 'badge-green' : 'badge-amber'}`}>{a.tipo}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.local}</td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {new Date(a.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(a.data_hora).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${a.status === 'Autorizado' ? 'badge-green' : 'badge-red'}`}>{a.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </Layout>
  );
}
