import type { Empresa, Funcionario, Visitante, Aviso, Acesso } from '../data/mockData';

export interface AdminContextType {
  empresas: Empresa[];
  funcionarios: Funcionario[];
  visitantes: Visitante[];
  avisos: Aviso[];
  acessos: Acesso[];
  loading: boolean;
  error: string | null;

  addEmpresa: (data: Omit<Empresa, 'id' | 'avatarColor'>) => Promise<void>;
  updateEmpresa: (id: string, data: Partial<Empresa>) => Promise<void>;
  removeEmpresa: (id: string) => Promise<void>;
  refreshEmpresas: () => Promise<void>;

  addFuncionario: (data: Omit<Funcionario, 'id' | 'avatarColor'>) => Promise<void>;
  updateFuncionario: (id: string, data: Partial<Funcionario>) => Promise<void>;
  removeFuncionario: (id: string) => Promise<void>;
  setStatusFuncionario: (id: string, status: Funcionario['status']) => Promise<void>;
  refreshFuncionarios: () => Promise<void>;

  addVisitante: (data: Omit<Visitante, 'id' | 'data_cadastro'>) => Promise<void>;
  updateVisitante: (id: string, data: Partial<Visitante>) => Promise<void>;
  removeVisitante: (id: string) => Promise<void>;
  aprovarVisitante: (id: string, autorizado_por: string) => Promise<void>;
  negarVisitante: (id: string) => Promise<void>;
  refreshVisitantes: () => Promise<void>;

  addAviso: (data: Omit<Aviso, 'id' | 'data_criacao'>) => Promise<void>;
  updateAviso: (id: string, data: Partial<Aviso>) => Promise<void>;
  removeAviso: (id: string) => Promise<void>;
  refreshAvisos: () => Promise<void>;

  addAcesso: (data: Omit<Acesso, 'id'>) => Promise<void>;
  refreshAcessos: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export interface ApiError extends Error {
  response?: { data?: { error?: string } };
}
