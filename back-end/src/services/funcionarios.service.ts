import sql from '../config/database';

export const findAll = () =>
  sql`SELECT f.*, e.nome as empresa_nome, e.andar, e.sala
      FROM funcionarios f LEFT JOIN empresas e ON e.id = f.empresa_id
      ORDER BY f.created_at DESC`;

export const findById = async (id: string) =>
  (await sql`SELECT * FROM funcionarios WHERE id=${id}`)[0] ?? null;

export const create = async (d: any) =>
  (await sql`
    INSERT INTO funcionarios (nome_completo, cpf, email, telefone, empresa_id, cargo, role, status, avatar_color)
    VALUES (${d.nome_completo}, ${d.cpf}, ${d.email}, ${d.telefone ?? null},
            ${d.empresa_id ?? null}, ${d.cargo ?? null}, ${d.role ?? 'funcionario'},
            ${d.status ?? 'Ativo'}, ${d.avatar_color ?? '#4c9eff'})
    RETURNING *
  `)[0];

export const update = async (id: string, d: any) =>
  (await sql`
    UPDATE funcionarios SET nome_completo=${d.nome_completo}, cpf=${d.cpf}, email=${d.email},
      telefone=${d.telefone ?? null}, empresa_id=${d.empresa_id ?? null}, cargo=${d.cargo ?? null},
      role=${d.role}, status=${d.status}
    WHERE id=${id} RETURNING *
  `)[0] ?? null;

export const updateStatus = async (id: string, status: string) =>
  (await sql`UPDATE funcionarios SET status=${status} WHERE id=${id} RETURNING *`)[0] ?? null;

export const remove = async (id: string) =>
  (await sql`DELETE FROM funcionarios WHERE id=${id} RETURNING id`)[0] ?? null;
