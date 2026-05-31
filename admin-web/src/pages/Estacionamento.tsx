import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Car, ParkingCircle, Settings, Users, RefreshCw, Save, Clock, AlertCircle, ArrowUpRight, Crown, ShieldOff } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const token = () => localStorage.getItem('token') ?? '';
const h = () => ({ headers: { Authorization: `Bearer ${token()}` } });

type Sessao = {
  id: string; user_id: string;
  nome_usuario?: string; email_usuario?: string; role_usuario?: string;
  entrada: string; saida?: string; pago_em?: string;
  valor_cobrado?: number; status: string;
  placa?: string; origem_pagamento?: string;
};

type Plano = {
  id: string; user_id: string;
  nome_usuario?: string; email_usuario?: string; role_usuario?: string;
  status: string; inicio: string; vencimento: string; valor: number;
};

type Tarifa = { valor_hora: number; valor_diaria: number; valor_mensalidade: number; tolerancia_minutos: number };
type Stats  = { mensalistas: number; entradas_hoje: number; sessoes_ativas: number };

const STATUS_SESSAO: Record<string, { cls: string; label: string }> = {
  ativa:                { cls: 'badge-blue',    label: 'Ativa'             },
  aguardando_pagamento: { cls: 'badge-amber',   label: 'Aguard. Pagamento' },
  paga:                 { cls: 'badge-green',   label: 'Paga'              },
  cancelada:            { cls: 'badge-red',     label: 'Cancelada'         },
};

const ROLE_CFG: Record<string, { cls: string; label: string }> = {
  admin:       { cls: 'badge-blue',    label: 'Admin'       },
  funcionario: { cls: 'badge-neutral', label: 'Usuário' },
  visitante:   { cls: 'badge-amber',   label: 'Visitante'   },
};

// Formata placa no padrão brasileiro: ABC-1234 ou ABC-1D23 (Mercosul)
const formatPlaca = (placa?: string) => {
  if (!placa) return '—';
  const c = placa.replace(/[^A-Z0-9]/g, '');
  return c.length > 3 ? `${c.slice(0, 3)}-${c.slice(3)}` : c;
};

// Calcula status real do plano considerando vencimento
const statusPlano = (p: Plano): { cls: string; label: string; bloqueado: boolean } => {
  const hoje = new Date().toISOString().split('T')[0]!;
  if (p.status === 'cancelado') return { cls: 'badge-neutral', label: 'Cancelado',  bloqueado: true };
  if (new Date(p.vencimento) < new Date(hoje)) return { cls: 'badge-red', label: 'Vencido', bloqueado: true };
  return { cls: 'badge-green', label: 'Ativo', bloqueado: false };
};

export default function Estacionamento() {
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [sessoes,  setSessoes]  = useState<Sessao[]>([]);
  const [planos,   setPlanos]   = useState<Plano[]>([]);
  const [tarifa,   setTarifa]   = useState<Tarifa | null>(null);
  const [form,     setForm]     = useState<Tarifa | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab,    setTab]    = useState<'dashboard' | 'mensalistas' | 'sessoes' | 'tarifas'>('dashboard');

  const carregar = useCallback(async () => {
    setLoading(true);
    const [sRes, seRes, tRes, pRes] = await Promise.allSettled([
      axios.get(`${API}/estacionamento/dashboard`,     h()),
      axios.get(`${API}/estacionamento/sessoes/todas`, h()),
      axios.get(`${API}/estacionamento/tarifas`,       h()),
      axios.get(`${API}/estacionamento/planos/todos`,  h()),
    ]);
    if (sRes.status  === 'fulfilled') setStats(sRes.value.data);
    if (seRes.status === 'fulfilled') setSessoes(seRes.value.data);
    if (tRes.status  === 'fulfilled') { setTarifa(tRes.value.data); setForm(tRes.value.data); }
    if (pRes.status  === 'fulfilled') setPlanos(pRes.value.data);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const salvarTarifas = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await axios.put(`${API}/estacionamento/tarifas`, form, h());
      setTarifa(form);
      alert('Tarifas atualizadas com sucesso!');
    } catch { alert('Erro ao salvar tarifas'); }
    finally { setSaving(false); }
  };

  const calcularCustoEstimado = (s: Sessao) => {
    if (s.valor_cobrado != null) return Number(s.valor_cobrado).toFixed(2);
    if (!tarifa) return '—';
    const horas = Math.ceil((Date.now() - new Date(s.entrada).getTime()) / 3600000);
    return Math.min(horas * Number(tarifa.valor_hora), Number(tarifa.valor_diaria)).toFixed(2);
  };

  const duracao = (entrada: string, fim?: string) => {
    const ms = (fim ? new Date(fim) : new Date()).getTime() - new Date(entrada).getTime();
    return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}min`;
  };

  const sessoesAbertas = sessoes.filter(s => !s.saida && ['ativa', 'aguardando_pagamento'].includes(s.status));
  const planosVencidos  = planos.filter(p => statusPlano(p).bloqueado).length;

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'dashboard',   label: 'Dashboard'                },
    { id: 'mensalistas', label: 'Mensalistas'              },
    { id: 'sessoes',     label: 'Acessos do Estacionamento'},
    { id: 'tarifas',     label: 'Tarifas'                  },
  ];

  return (
    <Layout title="Estacionamento" subtitle="Gestão de sessões, mensalistas e tarifas">

      {/* Tab bar */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="btn btn-ghost btn-sm"
            style={{
              borderRadius: '8px 8px 0 0',
              borderBottom: `2px solid ${tab === t.id ? 'var(--blue)' : 'transparent'}`,
              color:      tab === t.id ? 'var(--blue)' : 'var(--text-secondary)',
              fontWeight: tab === t.id ? 700 : 500,
              marginBottom: -1, paddingBottom: 10,
            }}>
            {t.label}
            {t.id === 'sessoes'     && sessoesAbertas.length > 0 && (
              <span className="nav-item-badge" style={{ marginLeft: 6, fontSize: 9 }}>{sessoesAbertas.length}</span>
            )}
            {t.id === 'mensalistas' && planosVencidos > 0 && (
              <span className="nav-item-badge" style={{ marginLeft: 6, fontSize: 9, background: 'var(--red)' }}>{planosVencidos}</span>
            )}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost btn-icon" onClick={carregar} style={{ marginBottom: 6 }}>
          <RefreshCw size={15} color="var(--text-muted)" />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 13 }}>Carregando...</div>
      ) : (
        <>
          {/* ══ DASHBOARD ══ */}
          {tab === 'dashboard' && stats && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
                {([
                  { Icon: Users,         label: 'Mensalistas',   value: stats.mensalistas,    color: '#ffaa00', sub: 'planos ativos',        trend: 'Este mês',  pos: true },
                  { Icon: Car,           label: 'Entradas hoje', value: stats.entradas_hoje,  color: '#4c9eff', sub: 'registros de acesso',  trend: 'Hoje',      pos: true },
                  { Icon: ParkingCircle, label: 'Dentro agora',  value: stats.sessoes_ativas, color: '#22d35e', sub: 'sem saída registrada', trend: stats.sessoes_ativas > 0 ? `${stats.sessoes_ativas} veículo${stats.sessoes_ativas !== 1 ? 's' : ''}` : 'Vazio', pos: true },
                ] as { Icon: React.ElementType; label: string; value: number; color: string; sub: string; trend: string; pos: boolean }[]).map(s => (
                  <div key={s.label} className="stat-card" style={{ borderColor: `${s.color}22` }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.color}, transparent)`, borderRadius: '18px 18px 0 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="stat-icon" style={{ background: `${s.color}18`, borderRadius: 14 }}>
                        <s.Icon size={20} color={s.color} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: 'var(--green)', padding: '3px 8px', borderRadius: 20, background: 'rgba(34,211,94,0.08)' }}>
                        <ArrowUpRight size={10} />{s.trend}
                      </div>
                    </div>
                    <div className="stat-value" style={{ color: s.color, marginTop: 14, fontSize: 30 }}>{s.value}</div>
                    <div className="stat-label" style={{ marginTop: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {tarifa && (
                <div className="card">
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Settings size={16} color="var(--text-muted)" />
                      <h3>Tarifas vigentes</h3>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
                    {[
                      { label: 'Por hora',    value: `R$ ${Number(tarifa.valor_hora).toFixed(2)}`        },
                      { label: 'Diária máx.', value: `R$ ${Number(tarifa.valor_diaria).toFixed(2)}`      },
                      { label: 'Mensalidade', value: `R$ ${Number(tarifa.valor_mensalidade).toFixed(2)}` },
                      { label: 'Tolerância',  value: `${tarifa.tolerancia_minutos} min`                  },
                    ].map(({ label, value }, i, arr) => (
                      <div key={label} style={{ textAlign: 'center', padding: '14px 0', borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div className="stat-label">{label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 6 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sessoesAbertas.length > 0 && (
                <div className="alert-banner warning" style={{ marginTop: 16 }}>
                  <AlertCircle size={18} />
                  <div>
                    <strong>{sessoesAbertas.length} veículo(s) sem pagamento.</strong>{' '}
                    Acesse <strong>Acessos do Estacionamento</strong> para registrar pagamento no balcão.
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══ MENSALISTAS ══ */}
          {tab === 'mensalistas' && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Mensalista</th>
                    <th>Perfil</th>
                    <th>Início do plano</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {planos.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 0' }}>
                        Nenhum plano de mensalidade cadastrado
                      </td>
                    </tr>
                  ) : planos.map(p => {
                    const st      = statusPlano(p);
                    const roleCfg = ROLE_CFG[p.role_usuario ?? 'funcionario'] ?? ROLE_CFG.funcionario;
                    return (
                      <tr key={p.id}>
                        {/* Nome */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Crown size={14} color={st.bloqueado ? 'var(--text-muted)' : 'var(--amber)'} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                                {p.nome_usuario ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                {p.email_usuario ?? '—'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Perfil */}
                        <td>
                          <span className={`badge ${roleCfg.cls}`}>{roleCfg.label}</span>
                        </td>

                        {/* Início */}
                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          {new Date(p.inicio).toLocaleDateString('pt-BR')}
                        </td>

                        {/* Vencimento */}
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 700, color: st.bloqueado ? 'var(--red)' : 'var(--text-primary)' }}>
                            {new Date(p.vencimento).toLocaleDateString('pt-BR')}
                          </div>
                          {st.bloqueado && (
                            <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <ShieldOff size={9} /> Catraca bloqueada
                            </div>
                          )}
                        </td>

                        {/* Valor */}
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          R$ {Number(p.valor).toFixed(2)}
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`badge ${st.cls}`}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ══ ACESSOS DO ESTACIONAMENTO ══ */}
          {tab === 'sessoes' && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Placa</th>
                    <th>Entrada</th>
                    <th>Saída</th>
                    <th>Permanência</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {sessoes.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 0' }}>
                        Nenhum acesso registrado
                      </td>
                    </tr>
                  ) : sessoes.map(s => {
                    const stCfg   = STATUS_SESSAO[s.status] ?? { cls: 'badge-neutral', label: s.status };
                    const roleCfg = ROLE_CFG[s.role_usuario ?? 'visitante'] ?? ROLE_CFG.visitante;
                    return (
                      <tr key={s.id}>
                        {/* Usuário */}
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                            {s.nome_usuario ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.email_usuario}</div>
                          <span className={`badge ${roleCfg.cls}`} style={{ marginTop: 4, display: 'inline-flex' }}>{roleCfg.label}</span>
                        </td>

                        {/* Placa */}
                        <td style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13, letterSpacing: '0.05em' }}>
                          {formatPlaca(s.placa)}
                        </td>

                        {/* Entrada */}
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{new Date(s.entrada).toLocaleDateString('pt-BR')}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={10} />
                            {new Date(s.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* Saída */}
                        <td>
                          {s.saida ? (
                            <>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{new Date(s.saida).toLocaleDateString('pt-BR')}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Clock size={10} />
                                {new Date(s.saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        {/* Permanência */}
                        <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{duracao(s.entrada, s.saida)}</td>

                        {/* Valor */}
                        <td style={{ fontWeight: 700 }}>
                          R$ {calcularCustoEstimado(s)}
                          {!s.valor_cobrado && s.status !== 'paga' && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>estimado</div>
                          )}
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`badge ${stCfg.cls}`}>{stCfg.label}</span>
                        </td>

                        {/* Pagamento */}
                        <td>
                          {s.status === 'paga' ? (
                            <span className={`badge ${s.origem_pagamento === 'balcao' ? 'badge-purple' : 'badge-green'}`}>
                              {s.origem_pagamento === 'balcao' ? 'Balcão' : 'App'}
                            </span>
                          ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ══ TARIFAS ══ */}
          {tab === 'tarifas' && form && (
            <div className="card" style={{ maxWidth: 480 }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Settings size={16} color="var(--blue)" />
                  <h3>Configurar Tarifas</h3>
                </div>
              </div>
              {([
                { key: 'valor_hora',        label: 'Valor por hora',                  step: 0.01, prefix: 'R$' },
                { key: 'valor_diaria',       label: 'Diária máxima',                  step: 0.01, prefix: 'R$' },
                { key: 'valor_mensalidade',  label: 'Mensalidade',                    step: 0.01, prefix: 'R$' },
                { key: 'tolerancia_minutos', label: 'Tolerância após pagamento',       step: 1,    prefix: 'min' },
              ] as { key: keyof Tarifa; label: string; step: number; prefix: string }[]).map(({ key, label, step, prefix }) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', pointerEvents: 'none',
                    }}>
                      {prefix}
                    </span>
                    <input
                      type="number" value={form[key]}
                      onChange={e => setForm(f => f ? { ...f, [key]: Number(e.target.value) } : f)}
                      min={0} step={step}
                      style={{ paddingLeft: prefix === 'R$' ? 36 : 44 }}
                    />
                  </div>
                </div>
              ))}
              <button onClick={salvarTarifas} disabled={saving} className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                <Save size={15} />
                {saving ? 'Salvando...' : 'Salvar Tarifas'}
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
