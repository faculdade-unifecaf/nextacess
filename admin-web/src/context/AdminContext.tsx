import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Usuario, Plano, Matricula, Financeiro, Professor, Alerta,
  usuarios as initUsuarios,
  planos as initPlanos,
  matriculas as initMatriculas,
  financeiro as initFinanceiro,
  professores as initProfessores,
  alertas as initAlertas,
} from '../data/mockData';

function genId() { return Math.random().toString(36).slice(2, 9); }

const COLORS = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899','#06b6d4','#f97316','#84cc16'];
let colorIdx = 0;
const nextColor = () => COLORS[(colorIdx++) % COLORS.length];

interface AdminContextType {
  // Data
  usuarios: Usuario[];
  planos: Plano[];
  matriculas: Matricula[];
  financeiro: Financeiro[];
  professores: Professor[];
  alertas: Alerta[];

  // Usuários CRUD
  addUsuario: (data: Omit<Usuario, 'id' | 'avatarColor'>, planoId: string) => void;
  updateUsuario: (id: string, data: Partial<Usuario>) => void;
  removeUsuario: (id: string) => void;
  setStatusUsuario: (id: string, status: Usuario['status']) => void;

  // Matrículas
  addMatricula: (data: Omit<Matricula, 'id'>) => void;
  updateMatricula: (id: string, data: Partial<Matricula>) => void;

  // Planos CRUD
  addPlano: (data: Omit<Plano, 'id'>) => void;
  updatePlano: (id: string, data: Partial<Plano>) => void;
  removePlano: (id: string) => void;

  // Professores CRUD
  addProfessor: (data: Omit<Professor, 'id' | 'avatarColor'>) => void;
  updateProfessor: (id: string, data: Partial<Professor>) => void;
  toggleProfessorStatus: (id: string) => void;

  // Alertas
  addAlerta: (data: Omit<Alerta, 'id' | 'data_criacao'>) => void;
  updateAlerta: (id: string, data: Partial<Alerta>) => void;
  removeAlerta: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [usuarios,    setUsuarios]    = useState<Usuario[]>(initUsuarios);
  const [planos,      setPlanos]      = useState<Plano[]>(initPlanos);
  const [matriculas,  setMatriculas]  = useState<Matricula[]>(initMatriculas);
  const [financeiroList, setFinanceiro] = useState<Financeiro[]>(initFinanceiro);
  const [professores, setProfessores] = useState<Professor[]>(initProfessores);
  const [alertas,     setAlertas]     = useState<Alerta[]>(initAlertas);

  // ── Usuários ──────────────────────────────────────────────────────────────
  const addUsuario = (data: Omit<Usuario, 'id' | 'avatarColor'>, planoId: string) => {
    const novo: Usuario = { ...data, id: genId(), avatarColor: nextColor() };
    setUsuarios(prev => [novo, ...prev]);

    const plano = planos.find(p => p.id === planoId);
    if (plano) {
      const hoje = new Date().toISOString().slice(0, 10);
      const fim = new Date(Date.now() + plano.duracao_dias * 86400000).toISOString().slice(0, 10);
      const mat: Matricula = { id: genId(), usuario_id: novo.id, plano_id: planoId, data_inicio: hoje, data_fim: fim, status: 'Ativa' };
      setMatriculas(prev => [mat, ...prev]);
      const fin: Financeiro = { id: genId(), usuario_id: novo.id, matricula_id: mat.id, valor: plano.valor, data_vencimento: fim, status: 'Pendente' };
      setFinanceiro(prev => [fin, ...prev]);
    }
  };

  const updateUsuario = (id: string, data: Partial<Usuario>) =>
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));

  const removeUsuario = (id: string) => {
    setUsuarios(prev => prev.filter(u => u.id !== id));
    setMatriculas(prev => prev.filter(m => m.usuario_id !== id));
    setFinanceiro(prev => prev.filter(f => f.usuario_id !== id));
  };

  const setStatusUsuario = (id: string, status: Usuario['status']) =>
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, status } : u));

  // ── Matrículas ────────────────────────────────────────────────────────────
  const addMatricula = (data: Omit<Matricula, 'id'>) =>
    setMatriculas(prev => [{ ...data, id: genId() }, ...prev]);

  const updateMatricula = (id: string, data: Partial<Matricula>) =>
    setMatriculas(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));

  // ── Planos ────────────────────────────────────────────────────────────────
  const addPlano = (data: Omit<Plano, 'id'>) =>
    setPlanos(prev => [{ ...data, id: genId() }, ...prev]);

  const updatePlano = (id: string, data: Partial<Plano>) =>
    setPlanos(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));

  const removePlano = (id: string) =>
    setPlanos(prev => prev.filter(p => p.id !== id));

  // ── Professores ───────────────────────────────────────────────────────────
  const addProfessor = (data: Omit<Professor, 'id' | 'avatarColor'>) =>
    setProfessores(prev => [{ ...data, id: genId(), avatarColor: nextColor() }, ...prev]);

  const updateProfessor = (id: string, data: Partial<Professor>) =>
    setProfessores(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));

  const toggleProfessorStatus = (id: string) =>
    setProfessores(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === 'Ativo' ? 'Inativo' : 'Ativo' } : p
    ));

  // ── Alertas ───────────────────────────────────────────────────────────────
  const addAlerta = (data: Omit<Alerta, 'id' | 'data_criacao'>) =>
    setAlertas(prev => [{ ...data, id: genId(), data_criacao: new Date().toISOString().slice(0, 10) }, ...prev]);

  const updateAlerta = (id: string, data: Partial<Alerta>) =>
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));

  const removeAlerta = (id: string) =>
    setAlertas(prev => prev.filter(a => a.id !== id));

  return (
    <AdminContext.Provider value={{
      usuarios, planos, matriculas, financeiro: financeiroList, professores, alertas,
      addUsuario, updateUsuario, removeUsuario, setStatusUsuario,
      addMatricula, updateMatricula,
      addPlano, updatePlano, removePlano,
      addProfessor, updateProfessor, toggleProfessorStatus,
      addAlerta, updateAlerta, removeAlerta,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin deve ser usado dentro de AdminProvider');
  return ctx;
}
