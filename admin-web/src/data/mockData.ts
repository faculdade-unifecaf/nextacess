export type StatusUsuario = 'Ativo' | 'Inativo' | 'Bloqueado';
export type StatusMatricula = 'Ativa' | 'Vencida' | 'Cancelada';
export type StatusFinanceiro = 'Pendente' | 'Pago' | 'Vencido' | 'Inadimplente';
export type MetodoPagamento = 'PIX' | 'Cartão' | 'Boleto' | 'Dinheiro';
export type TipoContrato = 'CLT' | 'PJ' | 'Freelancer';
export type TipoAlerta = 'Informativo' | 'Manutenção' | 'Aviso';
export type PrioridadeAlerta = 'Baixa' | 'Média' | 'Alta';

// ── Usuário (alunos) ──────────────────────────────────────────────────────────
export interface Usuario {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'Outro';
  email: string;
  telefone: string;
  data_cadastro: string;
  status: StatusUsuario;
  avatarColor: string; // UI only
}

// ── Plano ─────────────────────────────────────────────────────────────────────
export interface Plano {
  id: string;
  nome: string;
  valor: number;
  duracao_dias: number;
  descricao: string;
  ativo: boolean;
}

// ── Matrícula ─────────────────────────────────────────────────────────────────
export interface Matricula {
  id: string;
  usuario_id: string;
  plano_id: string;
  data_inicio: string;
  data_fim: string;
  status: StatusMatricula;
}

// ── Financeiro ────────────────────────────────────────────────────────────────
export interface Financeiro {
  id: string;
  usuario_id: string;
  matricula_id: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: StatusFinanceiro;
  metodo_pagamento?: MetodoPagamento;
}

// ── Professor ─────────────────────────────────────────────────────────────────
export interface Professor {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'Outro';
  email: string;
  telefone: string;
  cref: string;
  especialidade: string;
  data_contratacao: string;
  tipo_contrato: TipoContrato;
  status: 'Ativo' | 'Inativo';
  avatarColor: string; // UI only
}

// ── Alerta ────────────────────────────────────────────────────────────────────
export interface Alerta {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: TipoAlerta;
  prioridade: PrioridadeAlerta;
  data_criacao: string;
  data_inicio: string;
  data_expiracao: string;
  ativo: boolean;
}

export const planos: Plano[] = [
  { id: 'p1', nome: 'Mensal', valor: 99.90, duracao_dias: 30, descricao: 'Acesso completo por 30 dias', ativo: true },
  { id: 'p2', nome: 'Trimestral', valor: 259.90, duracao_dias: 90, descricao: 'Acesso completo por 90 dias', ativo: true },
  { id: 'p3', nome: 'Semestral', valor: 449.90, duracao_dias: 180, descricao: 'Acesso completo por 180 dias', ativo: true },
  { id: 'p4', nome: 'Anual', valor: 799.90, duracao_dias: 365, descricao: 'Acesso completo por 365 dias', ativo: true },
];

export const usuarios: Usuario[] = [
  { id: 'u1', nome_completo: 'Victor Santos', cpf: '111.222.333-44', data_nascimento: '1998-05-12', sexo: 'M', email: 'victor@email.com', telefone: '(11)91234-5678', data_cadastro: '2025-01-10', status: 'Ativo', avatarColor: '#ef4444' },
  { id: 'u2', nome_completo: 'Marina Costa', cpf: '222.333.444-55', data_nascimento: '2000-09-24', sexo: 'F', email: 'marina@email.com', telefone: '(11)92345-6789', data_cadastro: '2025-02-01', status: 'Ativo', avatarColor: '#ec4899' },
  { id: 'u3', nome_completo: 'Lucas Pereira', cpf: '333.444.555-66', data_nascimento: '1995-11-30', sexo: 'M', email: 'lucas@email.com', telefone: '(11)93456-7890', data_cadastro: '2024-11-15', status: 'Bloqueado', avatarColor: '#f59e0b' },
  { id: 'u4', nome_completo: 'Ana Rodrigues', cpf: '444.555.666-77', data_nascimento: '1992-03-07', sexo: 'F', email: 'ana@email.com', telefone: '(11)94567-8901', data_cadastro: '2025-03-01', status: 'Ativo', avatarColor: '#22c55e' },
  { id: 'u5', nome_completo: 'Pedro Alves', cpf: '555.666.777-88', data_nascimento: '1997-07-19', sexo: 'M', email: 'pedro@email.com', telefone: '(11)95678-9012', data_cadastro: '2025-01-20', status: 'Ativo', avatarColor: '#3b82f6' },
  { id: 'u6', nome_completo: 'Camila Ferreira', cpf: '666.777.888-99', data_nascimento: '2001-12-03', sexo: 'F', email: 'camila@email.com', telefone: '(11)96789-0123', data_cadastro: '2025-03-10', status: 'Ativo', avatarColor: '#a855f7' },
  { id: 'u7', nome_completo: 'Rafael Moura', cpf: '777.888.999-00', data_nascimento: '1990-08-25', sexo: 'M', email: 'rafael@email.com', telefone: '(11)97890-1234', data_cadastro: '2024-09-05', status: 'Bloqueado', avatarColor: '#06b6d4' },
  { id: 'u8', nome_completo: 'Beatriz Nunes', cpf: '888.999.000-11', data_nascimento: '1999-02-14', sexo: 'F', email: 'beatriz@email.com', telefone: '(11)98901-2345', data_cadastro: '2025-02-15', status: 'Ativo', avatarColor: '#f97316' },
  { id: 'u9', nome_completo: 'Gabriel Torres', cpf: '999.000.111-22', data_nascimento: '1996-06-28', sexo: 'M', email: 'gabriel@email.com', telefone: '(11)99012-3456', data_cadastro: '2025-03-15', status: 'Ativo', avatarColor: '#84cc16' },
  { id: 'u10', nome_completo: 'Larissa Campos', cpf: '000.111.222-33', data_nascimento: '2002-10-11', sexo: 'F', email: 'larissa@email.com', telefone: '(11)90123-4567', data_cadastro: '2024-12-01', status: 'Inativo', avatarColor: '#78716c' },
];

export const matriculas: Matricula[] = [
  { id: 'm1', usuario_id: 'u1', plano_id: 'p4', data_inicio: '2025-01-10', data_fim: '2026-01-10', status: 'Ativa' },
  { id: 'm2', usuario_id: 'u2', plano_id: 'p1', data_inicio: '2025-04-01', data_fim: '2025-05-01', status: 'Ativa' },
  { id: 'm3', usuario_id: 'u3', plano_id: 'p2', data_inicio: '2024-11-15', data_fim: '2025-02-15', status: 'Vencida' },
  { id: 'm4', usuario_id: 'u4', plano_id: 'p3', data_inicio: '2025-03-01', data_fim: '2025-09-01', status: 'Ativa' },
  { id: 'm5', usuario_id: 'u5', plano_id: 'p1', data_inicio: '2025-03-20', data_fim: '2025-04-20', status: 'Ativa' },
  { id: 'm6', usuario_id: 'u6', plano_id: 'p4', data_inicio: '2025-03-10', data_fim: '2026-03-10', status: 'Ativa' },
  { id: 'm7', usuario_id: 'u7', plano_id: 'p2', data_inicio: '2024-09-05', data_fim: '2024-12-05', status: 'Vencida' },
  { id: 'm8', usuario_id: 'u8', plano_id: 'p1', data_inicio: '2025-02-15', data_fim: '2025-03-15', status: 'Ativa' },
  { id: 'm9', usuario_id: 'u9', plano_id: 'p3', data_inicio: '2025-03-15', data_fim: '2025-09-15', status: 'Ativa' },
  { id: 'm10', usuario_id: 'u10', plano_id: 'p1', data_inicio: '2024-12-01', data_fim: '2025-01-01', status: 'Cancelada' },
];

export const financeiro: Financeiro[] = [
  { id: 'f1', usuario_id: 'u1', matricula_id: 'm1', valor: 799.90, data_vencimento: '2025-01-10', data_pagamento: '2025-01-09', status: 'Pago', metodo_pagamento: 'PIX' },
  { id: 'f2', usuario_id: 'u2', matricula_id: 'm2', valor: 99.90, data_vencimento: '2025-05-01', data_pagamento: '2025-03-30', status: 'Pago', metodo_pagamento: 'Cartão' },
  { id: 'f3', usuario_id: 'u3', matricula_id: 'm3', valor: 259.90, data_vencimento: '2025-02-15', status: 'Inadimplente' },
  { id: 'f4', usuario_id: 'u4', matricula_id: 'm4', valor: 449.90, data_vencimento: '2025-03-01', data_pagamento: '2025-03-01', status: 'Pago', metodo_pagamento: 'Boleto' },
  { id: 'f5', usuario_id: 'u5', matricula_id: 'm5', valor: 99.90, data_vencimento: '2025-04-20', status: 'Pendente' },
  { id: 'f6', usuario_id: 'u6', matricula_id: 'm6', valor: 799.90, data_vencimento: '2025-03-10', data_pagamento: '2025-03-08', status: 'Pago', metodo_pagamento: 'PIX' },
  { id: 'f7', usuario_id: 'u7', matricula_id: 'm7', valor: 259.90, data_vencimento: '2024-12-05', status: 'Inadimplente' },
  { id: 'f8', usuario_id: 'u8', matricula_id: 'm8', valor: 99.90, data_vencimento: '2025-03-15', data_pagamento: '2025-03-14', status: 'Pago', metodo_pagamento: 'Dinheiro' },
  { id: 'f9', usuario_id: 'u9', matricula_id: 'm9', valor: 449.90, data_vencimento: '2025-04-15', status: 'Pendente' },
  { id: 'f10', usuario_id: 'u10', matricula_id: 'm10', valor: 99.90, data_vencimento: '2025-01-01', status: 'Vencido' },
];

export const professores: Professor[] = [
  { id: 'prof1', nome_completo: 'Carlos Henrique', cpf: '123.456.789-00', data_nascimento: '1988-04-15', sexo: 'M', email: 'carlos@nexus.com', telefone: '(11)98765-4321', cref: '012345-G/SP', especialidade: 'Musculação e Hipertrofia', data_contratacao: '2023-03-10', tipo_contrato: 'CLT', status: 'Ativo', avatarColor: '#3b82f6' },
  { id: 'prof2', nome_completo: 'Fernanda Lima', cpf: '987.654.321-00', data_nascimento: '1992-07-22', sexo: 'F', email: 'fernanda@nexus.com', telefone: '(11)97654-3210', cref: '054321-G/SP', especialidade: 'Funcional e CrossFit', data_contratacao: '2023-07-15', tipo_contrato: 'CLT', status: 'Ativo', avatarColor: '#ec4899' },
  { id: 'prof3', nome_completo: 'Ricardo Souza', cpf: '456.789.123-00', data_nascimento: '1985-11-08', sexo: 'M', email: 'ricardo@nexus.com', telefone: '(11)96543-2109', cref: '067890-G/SP', especialidade: 'Muay Thai e Artes Marciais', data_contratacao: '2024-01-08', tipo_contrato: 'PJ', status: 'Ativo', avatarColor: '#f59e0b' },
  { id: 'prof4', nome_completo: 'Juliana Ramos', cpf: '321.654.987-00', data_nascimento: '1990-03-30', sexo: 'F', email: 'juliana@nexus.com', telefone: '(11)95432-1098', cref: '089012-G/SP', especialidade: 'Pilates e Reabilitação', data_contratacao: '2022-11-20', tipo_contrato: 'Freelancer', status: 'Inativo', avatarColor: '#a855f7' },
];

export const alertas: Alerta[] = [
  { id: 'al1', titulo: 'Manutenção equipamentos', mensagem: 'Academia fechada sábado 22/03 para manutenção geral.', tipo: 'Manutenção', prioridade: 'Alta', data_criacao: '2025-03-15', data_inicio: '2025-03-15', data_expiracao: '2025-03-22', ativo: true },
  { id: 'al2', titulo: 'Aula de Muay Thai', mensagem: 'Novas turmas de Muay Thai às ter/qui às 19h. Vagas limitadas!', tipo: 'Informativo', prioridade: 'Média', data_criacao: '2025-03-10', data_inicio: '2025-03-10', data_expiracao: '2025-04-10', ativo: true },
  { id: 'al3', titulo: 'Sistema atualizado', mensagem: 'O sistema passou por melhorias de desempenho e segurança.', tipo: 'Aviso', prioridade: 'Baixa', data_criacao: '2025-03-01', data_inicio: '2025-03-01', data_expiracao: '2025-03-31', ativo: false },
];

// ── Receita mensal
export const receitaMensal = [
  { mes: 'Set', valor: 5200 }, { mes: 'Out', valor: 6100 }, { mes: 'Nov', valor: 5800 },
  { mes: 'Dez', valor: 7200 }, { mes: 'Jan', valor: 8100 }, { mes: 'Fev', valor: 7600 },
  { mes: 'Mar', valor: 8900 },
];
