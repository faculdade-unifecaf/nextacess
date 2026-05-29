import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Car, ParkingCircle, Crown, Settings, TrendingUp, Users, DollarSign, RefreshCw, Save } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const token = () => localStorage.getItem('token') ?? '';
const h = () => ({ headers: { Authorization: `Bearer ${token()}` } });

type Sessao  = { id: string; user_id: string; entrada: string; saida?: string; valor_cobrado?: number; status: string; placa?: string };
type Tarifa  = { valor_hora: number; valor_diaria: number; valor_mensalidade: number; tolerancia_minutos: number };
type Stats   = { mensalistas: number; entradas_hoje: number; faturamento_hoje: number; sessoes_ativas: number };

const statusCls: Record<string, string> = {
  ativa:               'bg-blue-500/15 text-blue-400',
  aguardando_pagamento:'bg-yellow-500/15 text-yellow-400',
  paga:                'bg-green-500/15 text-green-400',
  cancelada:           'bg-red-500/15 text-red-400',
};

export default function Estacionamento() {
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [sessoes,  setSessoes]  = useState<Sessao[]>([]);
  const [tarifa,   setTarifa]   = useState<Tarifa | null>(null);
  const [form,     setForm]     = useState<Tarifa | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [tab,      setTab]      = useState<'dashboard'|'sessoes'|'tarifas'>('dashboard');

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, seRes, tRes] = await Promise.all([
        axios.get(`${API}/estacionamento/dashboard`,    h()),
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
    } catch { alert('Erro ao salvar tarifas'); }
    finally { setSaving(false); }
  };

  const duracao = (entrada: string, saida?: string) => {
    const ms = (saida ? new Date(saida) : new Date()).getTime() - new Date(entrada).getTime();
    const h  = Math.floor(ms / 3600000);
    const m  = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}min`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <ParkingCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Estacionamento</h1>
              <p className="text-sm text-slate-400">Gestão e tarifas</p>
            </div>
          </div>
          <button onClick={carregar} className="btn-ghost p-2 rounded-lg">
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700/50">
          {(['dashboard', 'sessoes', 'tarifas'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
              {t === 'dashboard' ? 'Dashboard' : t === 'sessoes' ? 'Sessões' : 'Tarifas'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Dashboard */}
            {tab === 'dashboard' && stats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <StatCard icon={<Users className="w-5 h-5 text-yellow-400" />}
                    label="Mensalistas" value={stats.mensalistas} color="yellow" />
                  <StatCard icon={<Car className="w-5 h-5 text-blue-400" />}
                    label="Entradas hoje" value={stats.entradas_hoje} color="blue" />
                  <StatCard icon={<ParkingCircle className="w-5 h-5 text-green-400" />}
                    label="Sessões ativas" value={stats.sessoes_ativas} color="green" />
                  <StatCard icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
                    label="Faturado hoje" value={`R$ ${Number(stats.faturamento_hoje).toFixed(2)}`} color="emerald" />
                </div>

                {tarifa && (
                  <div className="card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-300">Tarifas atuais</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Por hora</p>
                        <p className="text-lg font-bold text-white">R$ {Number(tarifa.valor_hora).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Diária máx.</p>
                        <p className="text-lg font-bold text-white">R$ {Number(tarifa.valor_diaria).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Mensalidade</p>
                        <p className="text-lg font-bold text-white">R$ {Number(tarifa.valor_mensalidade).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sessões */}
            {tab === 'sessoes' && (
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left p-4 text-slate-400 font-semibold">Placa</th>
                      <th className="text-left p-4 text-slate-400 font-semibold">Entrada</th>
                      <th className="text-left p-4 text-slate-400 font-semibold">Duração</th>
                      <th className="text-left p-4 text-slate-400 font-semibold">Valor</th>
                      <th className="text-left p-4 text-slate-400 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessoes.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhuma sessão encontrada</td></tr>
                    ) : sessoes.map(s => (
                      <tr key={s.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                        <td className="p-4 font-mono font-bold text-white">{s.placa ?? '—'}</td>
                        <td className="p-4 text-slate-300">{new Date(s.entrada).toLocaleString('pt-BR')}</td>
                        <td className="p-4 text-slate-300">{duracao(s.entrada, s.saida)}</td>
                        <td className="p-4 text-white font-semibold">
                          {s.valor_cobrado ? `R$ ${Number(s.valor_cobrado).toFixed(2)}` : '—'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusCls[s.status] ?? 'bg-slate-500/15 text-slate-400'}`}>
                            {s.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tarifas */}
            {tab === 'tarifas' && form && (
              <div className="card p-6 space-y-4 max-w-md">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h2 className="text-base font-bold text-white">Configurar Tarifas</h2>
                </div>

                {[
                  { key: 'valor_hora',         label: 'Valor por hora (R$)' },
                  { key: 'valor_diaria',        label: 'Diária máxima (R$)' },
                  { key: 'valor_mensalidade',   label: 'Mensalidade (R$)' },
                  { key: 'tolerancia_minutos',  label: 'Tolerância de saída (min)' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">{label}</label>
                    <input
                      type="number"
                      value={(form as any)[key]}
                      onChange={e => setForm(f => f ? { ...f, [key]: Number(e.target.value) } : f)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      min={0}
                      step={key.includes('tolerancia') ? 1 : 0.01}
                    />
                  </div>
                ))}

                <button onClick={salvarTarifas} disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {saving ? 'Salvando...' : 'Salvar Tarifas'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-xl bg-${color}-500/15 flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-slate-400 font-semibold mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}
