import { createClient } from '@supabase/supabase-js';
import sql from '../config/database';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!,
);

const BUCKET = 'facial-fotos';

async function uploadFoto(user_id: string, sufixo: 'normal' | 'proxima', b64: string): Promise<string> {
  const base64Data = b64.includes(',') ? b64.split(',')[1] : b64;
  const buf  = Buffer.from(base64Data, 'base64');
  const path = `${user_id}_${sufixo}.jpg`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw new Error(`Storage upload falhou: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export const cadastrarFacial = async (
  user_id: string,
  foto_normal_b64: string,
  foto_proxima_b64?: string,
) => {
  const url_normal  = await uploadFoto(user_id, 'normal', foto_normal_b64);
  const url_proxima = foto_proxima_b64
    ? await uploadFoto(user_id, 'proxima', foto_proxima_b64)
    : null;

  return (await sql`
    INSERT INTO facial_cadastros (user_id, foto_url_normal, foto_url_proxima)
    VALUES (${user_id}, ${url_normal}, ${url_proxima})
    ON CONFLICT (user_id) DO UPDATE SET
      foto_url_normal  = ${url_normal},
      foto_url_proxima = COALESCE(${url_proxima}, facial_cadastros.foto_url_proxima),
      updated_at       = NOW()
    RETURNING id, user_id, created_at, updated_at
  `)[0];
};

export const getFacial = async (user_id: string) =>
  (await sql`
    SELECT id, user_id, foto_url_normal, foto_url_proxima, created_at
    FROM facial_cadastros WHERE user_id = ${user_id}
  `)[0] ?? null;

// IoT busca todos os cadastros — retorna URLs para download local
export const listarFaciais = async () =>
  sql`SELECT user_id, foto_url_normal, foto_url_proxima FROM facial_cadastros
      WHERE foto_url_normal IS NOT NULL`;

export const removerFacial = async (user_id: string) => {
  // Remove do Storage
  await supabase.storage.from(BUCKET).remove([
    `${user_id}_normal.jpg`,
    `${user_id}_proxima.jpg`,
  ]);
  return sql`DELETE FROM facial_cadastros WHERE user_id = ${user_id}`;
};
