import sql from '../config/database';

export const findAll = () =>
  sql`SELECT * FROM empresas ORDER BY created_at DESC`;

export const findById = async (id: string) =>
  (await sql`SELECT * FROM empresas WHERE id = ${id}`)[0] ?? null;

export const create = async (d: any) =>
  (await sql`
    INSERT INTO empresas (nome, cnpj, andar, sala, responsavel, email, telefone, status, avatar_color)
    VALUES (${d.nome}, ${d.cnpj}, ${d.andar}, ${d.sala}, ${d.responsavel ?? null},
            ${d.email ?? null}, ${d.telefone ?? null}, ${d.status ?? 'Ativa'}, ${d.avatar_color ?? '#4c9eff'})
    RETURNING *
  `)[0];

export const update = async (id: string, d: any) =>
  (await sql`
    UPDATE empresas SET nome=${d.nome}, cnpj=${d.cnpj}, andar=${d.andar}, sala=${d.sala},
      responsavel=${d.responsavel ?? null}, email=${d.email ?? null},
      telefone=${d.telefone ?? null}, status=${d.status}
    WHERE id=${id} RETURNING *
  `)[0] ?? null;

export const remove = async (id: string) =>
  (await sql`DELETE FROM empresas WHERE id=${id} RETURNING id`)[0] ?? null;
