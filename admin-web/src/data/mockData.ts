export type StatusEmpresa = 'Ativa' | 'Inativa';
export type StatusFuncionario = 'Ativo' | 'Inativo' | 'Bloqueado';
export type StatusVisitante = 'Aguardando' | 'Aprovado' | 'Em visita' | 'Saiu' | 'Negado';
export type TipoAcesso = 'Entrada' | 'Saída';
export type StatusAcesso = 'Autorizado' | 'Negado';
export type TipoPessoa = 'Funcionário' | 'Visitante' | 'Administrador';
export type TipoAviso = 'Informativo' | 'Urgente' | 'Comunicado';
export type PrioridadeAviso = 'Baixa' | 'Média' | 'Alta';
export type PublicoAviso = 'Funcionários' | 'Visitantes' | 'Todos';
export type RoleFuncionario = 'admin' | 'funcionario';

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  andar: number;
  sala: string;
  responsavel: string;
  email: string;
  telefone: string;
  data_cadastro: string;
  status: StatusEmpresa;
  avatarColor: string;
}

export interface Funcionario {
  id: string;
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
  empresa_id: string;
  cargo: string;
  role: RoleFuncionario;
  data_cadastro: string;
  status: StatusFuncionario;
  avatarColor: string;
}

export interface Visitante {
  id: string;
  nome_completo: string;
  cpf: string;
  empresa_id: string;
  funcionario_id?: string;
  motivo: string;
  data_visita: string;
  hora_prevista: string;
  hora_entrada?: string;
  hora_saida?: string;
  status: StatusVisitante;
  autorizado_por?: string;
  data_cadastro: string;
}

export interface Aviso {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: TipoAviso;
  prioridade: PrioridadeAviso;
  publico: PublicoAviso;
  data_criacao: string;
  data_inicio: string;
  data_expiracao: string;
  ativo: boolean;
}

export interface Acesso {
  id: string;
  pessoa_nome: string;
  pessoa_tipo: TipoPessoa;
  empresa?: string;
  andar?: number;
  tipo: TipoAcesso;
  data_hora: string;
  local: string;
  status: StatusAcesso;
  observacao?: string;
}

export interface AcessoDiario {
  dia: string;
  total: number;
  negados: number;
}

