import sql from '../config/database';

export const findAll = () =>
  sql`SELECT * FROM avisos ORDER BY created_at DESC`;

export const create = async (d: any) =>
  (await sql`
    INSERT INTO avisos (titulo, mensagem, tipo, prioridade, publico, data_inicio, data_expiracao, ativo)
    VALUES (${d.titulo}, ${d.mensagem}, ${d.tipo ?? 'Informativo'}, ${d.prioridade ?? 'Média'},
            ${d.publico ?? 'Todos'}, ${d.data_inicio}, ${d.data_expiracao ?? null}, ${d.ativo ?? true})
    RETURNING *
  `)[0];

export const update = async (id: string, d: any) =>
  (await sql`
    UPDATE avisos SET titulo=${d.titulo}, mensagem=${d.mensagem}, tipo=${d.tipo},
      prioridade=${d.prioridade}, publico=${d.publico}, data_inicio=${d.data_inicio},
      data_expiracao=${d.data_expiracao ?? null}, ativo=${d.ativo}
    WHERE id=${id} RETURNING *
  `)[0] ?? null;

export const remove = async (id: string) =>
  (await sql`DELETE FROM avisos WHERE id=${id} RETURNING id`)[0] ?? null;
