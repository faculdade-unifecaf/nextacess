import sql from '../config/database';

export const cadastrarFacial = async (user_id: string, foto_base64: string) =>
  (await sql`
    INSERT INTO facial_cadastros (user_id, foto_base64)
    VALUES (${user_id}, ${foto_base64})
    ON CONFLICT (user_id) DO UPDATE SET foto_base64 = ${foto_base64}, updated_at = NOW()
    RETURNING id, user_id, created_at
  `)[0];

export const getFacial = async (user_id: string) =>
  (await sql`SELECT id, user_id, created_at FROM facial_cadastros WHERE user_id = ${user_id}`)[0] ?? null;

// IoT busca todos os cadastros para comparar localmente
export const listarFaciais = async () =>
  sql`SELECT user_id, foto_base64, updated_at FROM facial_cadastros`;

export const removerFacial = async (user_id: string) =>
  sql`DELETE FROM facial_cadastros WHERE user_id = ${user_id}`;
