import { Request, Response } from 'express';
import sql from '../config/database';
import * as acessosSvc from '../services/acessos.service';

// Guarda o último resultado por userId (TTL de 10s)
const recentAccess = new Map<string, { result: object; at: number }>();

export const validarQR = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token || !token.startsWith('NEXTACCESS:')) {
    res.status(400).json({ autorizado: false, motivo: 'Token inválido' }); return;
  }

  const parts     = token.split(':');
  const userId    = parts[1];
  const slotToken = parseInt(parts[2]);
  const slotAtual = Math.floor(Date.now() / 30000);

  if (!userId || isNaN(slotToken) || Math.abs(slotAtual - slotToken) > 1) {
    res.status(401).json({ autorizado: false, motivo: 'Token expirado' }); return;
  }

  // Verifica funcionários
  const funcs = await sql`SELECT id, nome_completo, role, empresa_id FROM funcionarios WHERE id=${userId} AND status='Ativo'`;
  if (funcs[0]) {
    const f   = funcs[0] as any;
    const emp = f.empresa_id
      ? (await sql`SELECT nome, andar FROM empresas WHERE id=${f.empresa_id}`)[0] as any
      : null;
    await acessosSvc.create({
      pessoa_nome: f.nome_completo, pessoa_tipo: f.role,
      empresa: emp?.nome ?? null, andar: emp?.andar ?? null,
      tipo: 'Entrada', status: 'Autorizado', local: 'Catraca Principal',
    });
    const result = { autorizado: true, nome: f.nome_completo, tipo: f.role, empresa: emp?.nome ?? null };
    recentAccess.set(userId, { result, at: Date.now() });
    res.json(result); return;
  }

  // Verifica visitantes
  const visits = await sql`SELECT id, nome_completo, status, empresa_id FROM visitantes WHERE id=${userId}`;
  if (visits[0]) {
    const v = visits[0] as any;
    if (v.status !== 'Aprovado') {
      const result = { autorizado: false, motivo: `Visitante com status: ${v.status}` };
      recentAccess.set(userId, { result, at: Date.now() });
      res.status(401).json(result); return;
    }
    const emp = v.empresa_id
      ? (await sql`SELECT nome, andar FROM empresas WHERE id=${v.empresa_id}`)[0] as any
      : null;
    await acessosSvc.create({
      pessoa_nome: v.nome_completo, pessoa_tipo: 'visitante',
      empresa: emp?.nome ?? null, andar: emp?.andar ?? null,
      tipo: 'Entrada', status: 'Autorizado', local: 'Catraca Principal',
    });
    await sql`UPDATE visitantes SET status='Em visita' WHERE id=${v.id}`;
    const result = { autorizado: true, nome: v.nome_completo, tipo: 'visitante', empresa: emp?.nome ?? null };
    recentAccess.set(userId, { result, at: Date.now() });
    res.json(result); return;
  }

  res.status(401).json({ autorizado: false, motivo: 'Usuário não encontrado' });
};

// Mobile faz polling neste endpoint
export const consultarAcesso = (req: Request, res: Response) => {
  const { userId } = req.params;
  const entry = recentAccess.get(userId);
  if (!entry || Date.now() - entry.at > 10000) {
    res.json({ novo: false }); return;
  }
  recentAccess.delete(userId); // consome o evento — não repete
  res.json({ novo: true, ...entry.result });
};
