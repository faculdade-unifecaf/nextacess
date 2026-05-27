import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Empresa, Funcionario, Visitante, Aviso, Acesso } from '../data/mockData';
import { AdminContextType, ApiError } from './types';
import { empresasService } from '../services/empresasService';
import { funcionariosService } from '../services/funcionariosService';
import { visitantesService } from '../services/visitantesService';
import { avisosService } from '../services/avisosService';
import { acessosService } from '../services/acessosService';

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refreshEmpresas = useCallback(async () => {
    try {
      clearError();
      const data = await empresasService.getAll();
      setEmpresas(data);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar empresas');
    }
  }, [clearError]);

  const refreshFuncionarios = useCallback(async () => {
    try {
      clearError();
      const data = await funcionariosService.getAll();
      setFuncionarios(data);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar funcionários');
    }
  }, [clearError]);

  const refreshVisitantes = useCallback(async () => {
    try {
      clearError();
      const data = await visitantesService.getAll();
      setVisitantes(data);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar visitantes');
    }
  }, [clearError]);

  const refreshAvisos = useCallback(async () => {
    try {
      clearError();
      const data = await avisosService.getAll();
      setAvisos(data);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar avisos');
    }
  }, [clearError]);

  const refreshAcessos = useCallback(async () => {
    try {
      clearError();
      const data = await acessosService.getAll();
      setAcessos(data);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar acessos');
    }
  }, [clearError]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        refreshEmpresas(),
        refreshFuncionarios(),
        refreshVisitantes(),
        refreshAvisos(),
        refreshAcessos(),
      ]);
    } catch {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [refreshEmpresas, refreshFuncionarios, refreshVisitantes, refreshAvisos, refreshAcessos]);

  useEffect(() => {
    if (localStorage.getItem('token')) refreshAll();
  }, [refreshAll]);

  const addEmpresa = async (data: Omit<Empresa, 'id' | 'avatarColor'>) => {
    try {
      clearError();
      await empresasService.create(data);
      await refreshEmpresas();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao criar empresa');
      throw err;
    }
  };

  const updateEmpresa = async (id: string, data: Partial<Empresa>) => {
    try {
      clearError();
      await empresasService.update(id, data);
      await refreshEmpresas();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao atualizar empresa');
      throw err;
    }
  };

  const removeEmpresa = async (id: string) => {
    try {
      clearError();
      await empresasService.delete(id);
      await refreshEmpresas();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao remover empresa');
      throw err;
    }
  };

  const addFuncionario = async (data: Omit<Funcionario, 'id' | 'avatarColor'>) => {
    try {
      clearError();
      await funcionariosService.create(data);
      await refreshFuncionarios();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao criar funcionário');
      throw err;
    }
  };

  const updateFuncionario = async (id: string, data: Partial<Funcionario>) => {
    try {
      clearError();
      await funcionariosService.update(id, data);
      await refreshFuncionarios();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao atualizar funcionário');
      throw err;
    }
  };

  const removeFuncionario = async (id: string) => {
    try {
      clearError();
      await funcionariosService.delete(id);
      await refreshFuncionarios();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao remover funcionário');
      throw err;
    }
  };

  const setStatusFuncionario = async (id: string, status: Funcionario['status']) => {
    try {
      clearError();
      await funcionariosService.updateStatus(id, status);
      await refreshFuncionarios();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao atualizar status');
      throw err;
    }
  };

  const addVisitante = async (data: Omit<Visitante, 'id' | 'data_cadastro'>) => {
    try {
      clearError();
      await visitantesService.create(data);
      await refreshVisitantes();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao criar visitante');
      throw err;
    }
  };

  const updateVisitante = async (id: string, data: Partial<Visitante>) => {
    try {
      clearError();
      await visitantesService.update(id, data);
      await refreshVisitantes();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao atualizar visitante');
      throw err;
    }
  };

  const removeVisitante = async (id: string) => {
    try {
      clearError();
      await visitantesService.delete(id);
      await refreshVisitantes();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao remover visitante');
      throw err;
    }
  };

  const aprovarVisitante = async (id: string, autorizado_por: string) => {
    try {
      clearError();
      await visitantesService.approve(id, autorizado_por);
      await refreshVisitantes();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao aprovar visitante');
      throw err;
    }
  };

  const negarVisitante = async (id: string) => {
    try {
      clearError();
      await visitantesService.deny(id);
      await refreshVisitantes();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao negar visitante');
      throw err;
    }
  };

  const addAviso = async (data: Omit<Aviso, 'id' | 'data_criacao'>) => {
    try {
      clearError();
      await avisosService.create(data);
      await refreshAvisos();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao criar aviso');
      throw err;
    }
  };

  const updateAviso = async (id: string, data: Partial<Aviso>) => {
    try {
      clearError();
      await avisosService.update(id, data);
      await refreshAvisos();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao atualizar aviso');
      throw err;
    }
  };

  const removeAviso = async (id: string) => {
    try {
      clearError();
      await avisosService.delete(id);
      await refreshAvisos();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao remover aviso');
      throw err;
    }
  };

  const addAcesso = async (data: Omit<Acesso, 'id'>) => {
    try {
      clearError();
      await acessosService.create(data);
      await refreshAcessos();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao registrar acesso');
      throw err;
    }
  };

  const value: AdminContextType = {
    empresas, funcionarios, visitantes, avisos, acessos, loading, error,
    addEmpresa, updateEmpresa, removeEmpresa, refreshEmpresas,
    addFuncionario, updateFuncionario, removeFuncionario, setStatusFuncionario, refreshFuncionarios,
    addVisitante, updateVisitante, removeVisitante, aprovarVisitante, negarVisitante, refreshVisitantes,
    addAviso, updateAviso, removeAviso, refreshAvisos,
    addAcesso, refreshAcessos, refreshAll,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin deve ser usado dentro de AdminProvider');
  return ctx;
}
