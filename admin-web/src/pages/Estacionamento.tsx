import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Car, ParkingCircle, Settings, Users, DollarSign, RefreshCw, Save, Clock, Banknote, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const token = () => localStorage.getItem('token') ?? '';
const h = () => ({ headers: { Authorization: `Bearer ${token()}` } });

type Sessao = {
  id: string;
  user_id: string;
  nome_usuario?: string;
  email_usuario?: string;
  role_usuario?: string;
  entrada: string;
  saida?: string;
  pago_em?: string;
  valor_cobrado?: number;
  status: string;
  placa?: string;
  origem_pagamento?: string;
};
type Tarifa = { valor_hora: number; valor_diaria: number; valor_mensalidade: number; tolerancia_minutos: number };
type Stats  = { mensalistas: number; entradas_hoje: number; faturamento_hoje: number; sessoes_ativas: number };

const STATUS_CFG: Record<string, { cls: string; label: string }> = {
  ativa:                { cls: 'badge-blue',    label: 'Ativa'             },
  aguardando_pagamento: { cls: 'badge-amber',   label: 'Aguard. Pagamento' },
  paga:                 { cls: 'badge-green',   label: 'Paga'              },
  cancelada:            { cls: 'badge-red',     label: 'Cancelada'         },
};

const ROLE_CFG: Record<string, { cls: string; label: string }> = {
  admin:        { cls: 'badge-blue',    label: 'Admin'       },
  funcionario:  { cls: 'badge-neutral', label: 'Funcionário' },
  visitante:    { cls: 'badge-amber',   label: 'Visitante'   },
};

export default function Estacionamento() {
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [sessoes,  setSessoes]  = useState<Sessao[]>([]);
  const [tarifa,   setTarifa]   = useState<Tarifa | null>(null);
  const [form,     setForm]     = useState<Tarifa | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [cobrando, setCobrando] = useState<string | null>(null);
  const [tab,      setTab]      = useState<'dashboard' | 'sessoes' | 'tarifas'>('dashboard');

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, seRes, tRes] = await Promise.all([
        axios.get(`${API}/estacionamento/dashboard`,     h()),
        axios.get(`${API}/estacionamento/sessoes/todas`, h()),
        axios.get(`${API}/estacionamento/tarifas`,       h()),
      ]);
      setStats(sRes.data);
      setSessoes(seRes.data);
      setTarifa(tRes.data);
      setForm(tRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const salvarTarifas = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await axios.put(`${API}/estacionamento/tarifas`, form, h());
      setTarifa(form);
      alert('Tarifas atualizadas com sucesso!');
    } catch {
      alert('Erro ao salvar tarifas');
    } finally {
      setSaving(false);
    }
  };

  const cobrarBalcao = async (sessao: Sessao) => {
    if (!confirm(`Registrar pagamento de R$ ${calcularCustoEstimado(sessao)} no balcão para ${sessao.nome_usuario ?? 'usuário'}?`)) return;
    setCobrando(sessao.id);
    try {
      await axios.post(`${API}/estacionamento/sessao/${sessao.id}/pagar-balcao`, {}, h());
      await carregar();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Erro ao registrar pagamento');
    } finally {
      setCobrando(null);
    }
  };

  const calcularCustoEstimado = (s: Sessao): string => {
    if (s.valor_cobrado != null) return Number(s.valor_cobrado).toFixed(2);
    if (!tarifa) return '—';
    const ms      = Date.now() - new Date(s.entrada).getTime();
    const horas   = Math.ceil(ms / 3600000);
    const bruto   = horas * Number(tarifa.valor_hora);
    const valor   = Math.min(bruto, Number(tarifa.valor_diaria));
    return valor.toFixed(2);
  };

  const duracao = (entrada: string, fim?: string) => {
    const ms = (fim ? new Date(fim) : new Date()).getTime() - new Date(entrada).getTime();
    const hh = Math.floor(ms / 3600000);
    const mm = Math.floor((ms % 3600000) / 60000);
    return `${hh}h ${mm}min`;
  };

  const tabs: { id: 'dashboard' | 'sessoes' | 'tarifas'; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'sessoes',   label: 'Sessões'   },
    { id: 'tarifas',   label: 'Tarifas'   },
  ];

  // Sessões que precisam de atenção da recepção (sem saída e ainda abertas)
  const sessoesAbertas = sessoes.filter(s => !s.saida && ['ativa', 'aguardando_pagamento'].includes(s.status));

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
              marginBottom: -1,
              paddingBottom: 10,
              position: 'relative',
            }}>
            {t.label}
            {t.id === 'sessoes' && sessoesAbertas.length > 0 && (
              <span className="nav-item-badge" style={{ marginLeft: 6, fontSize: 9 }}>{sessoesAbertas.length}</span>
            )}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost btn-icon" onClick={carregar} style={{ marginBottom: 6 }}>
          <RefreshCw size={15} color="var(--text-muted)" />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          Carregando...
        </div>
      ) : (
        <>
          {/* ── Dashboard ── */}
          {tab === 'dashboard' && stats && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { Icon: Users,         label: 'Mensalistas',    value: stats.mensalistas,    color: 'var(--amber)' },
                  { Icon: Car,           label: 'Entradas hoje',  value: stats.entradas_hoje,  color: 'var(--blue)'  },
                  { Icon: ParkingCircle, label: 'Dentro agora',   value: stats.sessoes_ativas, color: 'var(--green)' },
                  { Icon: DollarSign,    label: 'Faturado hoje',  value: `R$ ${Number(stats.faturamento_hoje).toFixed(2)}`, color: 'var(--green)' },
                ].map(({ Icon, label, value, color }) => (
                  <div key={label} className="stat-card" style={{ borderColor: `${color}22` }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: '18px 18px 0 0' }} />
                    <div className="stat-icon" style={{ background: `${color}18` }}>
                      <Icon size={20} color={color} />
                    </div>
                    <div className="stat-value" style={{ color, fontSize: typeof value === 'string' ? 22 : 30, marginTop: 14 }}>{value}</div>
                    <div className="stat-label" style={{ marginTop: 4 }}>{label}</div>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
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

              {/* Alerta para sessões pendentes */}
              {sessoesAbertas.length > 0 && (
                <div className="alert-banner warning" style={{ marginTop: 16 }}>
                  <AlertCircle size={18} />
                  <div>
                    <strong>{sessoesAbertas.length} veículo(s) no estacionamento sem pagamento.</strong>{' '}
                    Acesse <strong>Sessões</strong> para visualizar e registrar pagamento no balcão se necessário.
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Sessões ── */}
          {tab === 'sessoes' && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Placa</th>
                    <th>Entrada</th>
                    <th>Permanência</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Pagamento</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {sessoes.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 0' }}>
                        Nenhuma sessão registrada
                      </td>
                    </tr>
                  ) : sessoes.map(s => {
                    const statusCfg = STATUS_CFG[s.status] ?? { cls: 'badge-neutral', label: s.status };
                    const roleCfg   = ROLE_CFG[s.role_usuario ?? 'visitante'] ?? ROLE_CFG.visitante;
                    const podeBalcao = ['ativa', 'aguardando_pagamento'].includes(s.status) && !s.saida;

                    return (
                      <tr key={s.id}>
                        {/* Usuário */}
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                            {s.nome_usuario ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {s.email_usuario}
                          </div>
                          <span className={`badge ${roleCfg.cls}`} style={{ marginTop: 4, display: 'inline-flex' }}>
                            {roleCfg.label}
                          </span>
                        </td>

                        {/* Placa */}
                        <td style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>
                          {s.placa ?? '—'}
                        </td>

                        {/* Entrada */}
                        <td>
                          <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                            {new Date(s.entrada).toLocaleDateString('pt-BR')}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            <Clock size={10} style={{ marginRight: 3 }} />
                            {new Date(s.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* Permanência */}
                        <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          {duracao(s.entrada, s.saida)}
                        </td>

                        {/* Valor */}
                        <td style={{ fontWeight: 700 }}>
                          R$ {calcularCustoEstimado(s)}
                          {!s.valor_cobrado && s.status !== 'paga' && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>estimado</div>
                          )}
                        </td>

                        {/* Status da sessão */}
                        <td>
                          <span className={`badge ${statusCfg.cls}`}>{statusCfg.label}</span>
                          {s.saida && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                              Saiu {new Date(s.saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </td>

                        {/* Origem do pagamento */}
                        <td>
                          {s.status === 'paga' ? (
                            <span className={`badge ${s.origem_pagamento === 'balcao' ? 'badge-purple' : 'badge-green'}`}>
                              {s.origem_pagamento === 'balcao' ? 'Balcão' : 'App'}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                          )}
                        </td>

                        {/* Ação */}
                        <td>
                          {podeBalcao ? (
                            <button
                              onClick={() => cobrarBalcao(s)}
                              disabled={cobrando === s.id}
                              className="btn btn-sm"
                              style={{
                                background: 'var(--amber-dim)', color: 'var(--amber)',
                                border: '1px solid rgba(255,170,0,0.25)',
                                opacity: cobrando === s.id ? 0.6 : 1,
                              }}
                            >
                              <Banknote size={13} />
                              {cobrando === s.id ? 'Registrando...' : 'Cobrar Balcão'}
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Tarifas ── */}
          {tab === 'tarifas' && form && (
            <div className="card" style={{ maxWidth: 480 }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Settings size={16} color="var(--blue)" />
                  <h3>Configurar Tarifas</h3>
                </div>
              </div>
              {([
                { key: 'valor_hora',        label: 'Valor por hora (R$)',         step: 0.01 },
                { key: 'valor_diaria',       label: 'Diária máxima (R$)',          step: 0.01 },
                { key: 'valor_mensalidade',  label: 'Mensalidade (R$)',            step: 0.01 },
                { key: 'tolerancia_minutos', label: 'Tolerância após pagamento (min)', step: 1 },
              ] as { key: keyof Tarifa; label: string; step: number }[]).map(({ key, label, step }) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <input
                    type="number"
                    value={form[key]}
                    onChange={e => setForm(f => f ? { ...f, [key]: Number(e.target.value) } : f)}
                    min={0}
                    step={step}
                  />
                </div>
              ))}
              <button onClick={salvarTarifas} disabled={saving}
                className="btn btn-primary"
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
