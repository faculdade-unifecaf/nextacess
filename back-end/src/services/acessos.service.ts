import sql from '../config/database';

export const findAll = async (tipo?: string, status?: string, data?: string) => {
  const rows = await sql`SELECT * FROM acessos ORDER BY data_hora DESC LIMIT 500`;
  return rows.filter(r =>
    (!tipo   || r['tipo']   === tipo) &&
    (!status || r['status'] === status) &&
    (!data   || String(r['data_hora']).startsWith(data))
  );
};

export const create = async (d: any) =>
  (await sql`
    INSERT INTO acessos (pessoa_nome, pessoa_tipo, empresa, andar, tipo, data_hora, local, status, observacao)
    VALUES (${d.pessoa_nome}, ${d.pessoa_tipo}, ${d.empresa ?? null}, ${d.andar ?? null},
            ${d.tipo}, ${d.data_hora ?? new Date()}, ${d.local ?? 'Portaria Principal'},
            ${d.status}, ${d.observacao ?? null})
    RETURNING *
  `)[0];
