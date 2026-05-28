import sql from '../config/database';
import * as push from './push.service';

export const findAll = () =>
  sql`SELECT * FROM avisos ORDER BY created_at DESC`;

// Mapeia o público-alvo do aviso para os roles que devem ser notificados
const rolesForPublico = (publico: string): string[] => {
  switch (publico) {
    case 'Funcionários': return ['admin', 'funcionario'];
    case 'Visitantes':   return ['visitante'];
    default:             return ['admin', 'funcionario', 'visitante']; // 'Todos'
  }
};

export const create = async (d: any) => {
  const aviso = (await sql`
    INSERT INTO avisos (titulo, mensagem, tipo, prioridade, publico, data_inicio, data_expiracao, ativo)
    VALUES (${d.titulo}, ${d.mensagem}, ${d.tipo ?? 'Informativo'}, ${d.prioridade ?? 'Média'},
            ${d.publico ?? 'Todos'}, ${d.data_inicio}, ${d.data_expiracao ?? null}, ${d.ativo ?? true})
    RETURNING *
  `)[0] as any;

  // Só notifica avisos ativos; respeita o público-alvo
  if (aviso.ativo) {
    push.sendToRoles(rolesForPublico(aviso.publico), {
      title: `📢 ${aviso.titulo}`,
      body: aviso.mensagem.length > 120 ? `${aviso.mensagem.slice(0, 117)}...` : aviso.mensagem,
      data: { type: 'aviso', id: aviso.id },
    }).catch(err => console.error('[push] aviso:', err));
  }

  return aviso;
};

export const update = async (id: string, d: any) =>
  (await sql`
    UPDATE avisos SET titulo=${d.titulo}, mensagem=${d.mensagem}, tipo=${d.tipo},
      prioridade=${d.prioridade}, publico=${d.publico}, data_inicio=${d.data_inicio},
      data_expiracao=${d.data_expiracao ?? null}, ativo=${d.ativo}
    WHERE id=${id} RETURNING *
  `)[0] ?? null;

export const remove = async (id: string) =>
  (await sql`DELETE FROM avisos WHERE id=${id} RETURNING id`)[0] ?? null;
