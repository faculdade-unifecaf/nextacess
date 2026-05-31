import QRCode from 'qrcode';
import sql from '../config/database';
import * as push from './push.service';
import { sendVisitanteQR } from './email.service';

export const findAll = () =>
  sql`SELECT v.*, e.nome as empresa_nome, f.nome_completo as funcionario_nome
      FROM visitantes v
      LEFT JOIN empresas e ON e.id = v.empresa_id
      LEFT JOIN funcionarios f ON f.id = v.funcionario_id
      ORDER BY v.created_at DESC`;

export const findById = async (id: string) =>
  (await sql`SELECT * FROM visitantes WHERE id=${id}`)[0] ?? null;

const checkCpfUnico = async (cpf: string, excludeId?: string) => {
  const digits = (cpf ?? '').replace(/\D/g, '');
  if (!digits) return;
  const [existV] = await sql`
    SELECT id FROM visitantes
    WHERE REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = ${digits}
    ${excludeId ? sql`AND id <> ${excludeId}` : sql``}
  `;
  if (existV) throw Object.assign(new Error('CPF já cadastrado no sistema.'), { code: 'CPF_DUPLICADO' });
  const [existF] = await sql`
    SELECT id FROM funcionarios
    WHERE REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = ${digits}
  `;
  if (existF) throw Object.assign(new Error('CPF já cadastrado no sistema.'), { code: 'CPF_DUPLICADO' });
};

export const create = async (d: any) => {
  await checkCpfUnico(d.cpf ?? '');
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

export const aprovar = async (id: string, autorizado_por: string) => {
  const visitante = (await sql`
    UPDATE visitantes SET status='Aprovado', autorizado_por=${autorizado_por}
    WHERE id=${id} RETURNING *
  `)[0] as any ?? null;

  if (!visitante) return null;

  // Envia o QR Code por email somente se o visitante se cadastrou pelo formulário público
  if (visitante.email && visitante.qr_token) {
    const empresa = (await sql`
      SELECT nome, andar, sala FROM empresas WHERE id = ${visitante.empresa_id}
    `)[0] as any;

    const qrBuffer = await QRCode.toBuffer(visitante.qr_token, {
      width: 300, margin: 2,
      color: { dark: '#0a0a12', light: '#ffffff' },
    });

    sendVisitanteQR({
      to:            visitante.email,
      nome:          visitante.nome_completo,
      empresa:       empresa?.nome  ?? '',
      andar:         empresa?.andar ?? '',
      sala:          empresa?.sala  ?? '',
      data_visita:   visitante.data_visita?.toISOString?.().slice(0, 10) ?? visitante.data_visita,
      hora_prevista: visitante.hora_prevista ?? undefined,
      qr_token:      visitante.qr_token,
      qrBuffer,
    }).catch(err => console.error('[email] QR Code visitante:', err));
  }

  return visitante;
};

export const negar = async (id: string) =>
  (await sql`UPDATE visitantes SET status='Negado' WHERE id=${id} RETURNING *`)[0] ?? null;

export const remove = async (id: string) =>
  (await sql`DELETE FROM visitantes WHERE id=${id} RETURNING id`)[0] ?? null;
