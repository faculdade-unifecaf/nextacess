import { randomUUID } from 'crypto';
import sql from '../config/database';

export const migrate = async () => {
  await sql`ALTER TABLE visitantes ADD COLUMN IF NOT EXISTS telefone TEXT`;
  await sql`ALTER TABLE visitantes ADD COLUMN IF NOT EXISTS email TEXT`;
  await sql`ALTER TABLE visitantes ADD COLUMN IF NOT EXISTS qr_token TEXT UNIQUE`;
  await sql`ALTER TABLE visitantes ADD COLUMN IF NOT EXISTS qr_expires_at TIMESTAMPTZ`;
};

export const listarEmpresas = () =>
  sql`SELECT id, nome, andar, sala FROM empresas WHERE status = 'Ativa' ORDER BY nome`;

export const cadastrar = async (d: {
  nome_completo: string;
  cpf: string;
  email: string;
  telefone?: string;
  empresa_id: string;
  motivo: string;
  data_visita: string;
  hora_prevista?: string;
}) => {
  await migrate();

  // Verifica CPF duplicado (visitantes + funcionários)
  const cpfDigits = (d.cpf ?? '').replace(/\D/g, '');
  const [existV] = await sql`SELECT id FROM visitantes WHERE REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = ${cpfDigits}`;
  const [existF] = await sql`SELECT id FROM funcionarios WHERE REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = ${cpfDigits}`;
  if (existV || existF) throw Object.assign(new Error('CPF já cadastrado no sistema.'), { code: 'CPF_DUPLICADO' });

  const qr_token    = randomUUID();
  const qr_expires  = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const visitante = (await sql`
    INSERT INTO visitantes
      (nome_completo, cpf, email, telefone, empresa_id, motivo,
       data_visita, hora_prevista, status, qr_token, qr_expires_at)
    VALUES
      (${d.nome_completo}, ${d.cpf}, ${d.email}, ${d.telefone ?? null},
       ${d.empresa_id}, ${d.motivo}, ${d.data_visita},
       ${d.hora_prevista ?? null}, 'Aguardando', ${qr_token}, ${qr_expires})
    RETURNING *
  `)[0] as any;

  const empresa = (await sql`
    SELECT nome, andar, sala FROM empresas WHERE id = ${d.empresa_id}
  `)[0] as any;

  // QR Code gerado e salvo no DB, mas o email só é enviado quando a recepção aprovar.
  return visitante;
};

export const validarToken = async (token: string) => {
  await migrate();

  const row = (await sql`
    SELECT v.*, e.nome AS empresa_nome, e.andar, e.sala
    FROM visitantes v
    LEFT JOIN empresas e ON e.id = v.empresa_id
    WHERE v.qr_token = ${token}
  `)[0] as any ?? null;

  if (!row)                                         return { valido: false, motivo: 'QR Code não encontrado' };
  if (new Date(row.qr_expires_at) < new Date())    return { valido: false, motivo: 'QR Code expirado', visitante: row };

  return { valido: true, visitante: row };
};
