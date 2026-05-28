import sql from '../config/database';
import * as push from './push.service';

export const getMensagens = (empresa_id: string) =>
  sql`SELECT * FROM chat_mensagens WHERE empresa_id=${empresa_id} ORDER BY created_at ASC`;

export const sendMensagem = async (empresa_id: string, from_role: string, texto: string) => {
  const msg = (await sql`
    INSERT INTO chat_mensagens (empresa_id, from_role, texto)
    VALUES (${empresa_id}, ${from_role}, ${texto})
    RETURNING *
  `)[0];

  // Mensagem vinda da recepção (admin-web) → notifica o admin da empresa no celular
  if (from_role === 'recepcionista') {
    push.sendToEmpresaAdmins(empresa_id, {
      title: 'Mensagem da Recepção',
      body: texto.length > 120 ? `${texto.slice(0, 117)}...` : texto,
      data: { type: 'chat', empresa_id },
    }).catch(err => console.error('[push] chat:', err));
  }

  return msg;
};
