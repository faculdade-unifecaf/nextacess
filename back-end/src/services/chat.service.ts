import sql from '../config/database';

export const getMensagens = (empresa_id: string) =>
  sql`SELECT * FROM chat_mensagens WHERE empresa_id=${empresa_id} ORDER BY created_at ASC`;

export const sendMensagem = async (empresa_id: string, from_role: string, texto: string) =>
  (await sql`
    INSERT INTO chat_mensagens (empresa_id, from_role, texto)
    VALUES (${empresa_id}, ${from_role}, ${texto})
    RETURNING *
  `)[0];
