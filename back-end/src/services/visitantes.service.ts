import sql from '../config/database';
import * as push from './push.service';

export const findAll = () =>
  sql`SELECT v.*, e.nome as empresa_nome, f.nome_completo as funcionario_nome
      FROM visitantes v
      LEFT JOIN empresas e ON e.id = v.empresa_id
      LEFT JOIN funcionarios f ON f.id = v.funcionario_id
      ORDER BY v.created_at DESC`;

export const findById = async (id: string) =>
  (await sql`SELECT * FROM visitantes WHERE id=${id}`)[0] ?? null;

export const create = async (d: any) => {
  const visitante = (await sql`
    INSERT INTO visitantes (nome_completo, cpf, email, empresa_id, funcionario_id, motivo,
                             data_visita, hora_prevista, status)
    VALUES (${d.nome_completo}, ${d.cpf ?? null}, ${d.email ?? null}, ${d.empresa_id ?? null},
            ${d.funcionario_id ?? null}, ${d.motivo ?? null}, ${d.data_visita}, ${d.hora_prevista},
            'Aguardando')
    RETURNING *
  `)[0] as any;

  // Notifica os admins: há um visitante aguardando aprovação
  push.sendToRoles(['admin'], {
    title: 'Novo visitante aguardando',
    body: `${visitante.nome_completo} aguarda aprovação de acesso.`,
    data: { type: 'visitante', id: visitante.id },
  }).catch(err => console.error('[push] visitante:', err));

  return visitante;
};

export const update = async (id: string, d: any) =>
  (await sql`
    UPDATE visitantes SET nome_completo=${d.nome_completo}, cpf=${d.cpf ?? null},
      empresa_id=${d.empresa_id ?? null}, funcionario_id=${d.funcionario_id ?? null},
      motivo=${d.motivo ?? null}, data_visita=${d.data_visita}, hora_prevista=${d.hora_prevista},
      status=${d.status}
    WHERE id=${id} RETURNING *
  `)[0] ?? null;

export const aprovar = async (id: string, autorizado_por: string) =>
  (await sql`UPDATE visitantes SET status='Aprovado', autorizado_por=${autorizado_por}
             WHERE id=${id} RETURNING *`)[0] ?? null;

export const negar = async (id: string) =>
  (await sql`UPDATE visitantes SET status='Negado' WHERE id=${id} RETURNING *`)[0] ?? null;

export const remove = async (id: string) =>
  (await sql`DELETE FROM visitantes WHERE id=${id} RETURNING id`)[0] ?? null;
