import { Request, Response } from 'express';
import sql from '../config/database';
import * as acessosSvc from '../services/acessos.service';

export const validarQR = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token || !token.startsWith('NEXTACCESS:')) {
    res.status(400).json({ autorizado: false, motivo: 'Token inválido' }); return;
  }

  const parts = token.split(':');
  const userId = parts[1];
  const slotToken = parseInt(parts[2]);
  const slotAtual = Math.floor(Date.now() / 30000);

  if (!userId || isNaN(slotToken) || Math.abs(slotAtual - slotToken) > 1) {
    res.status(401).json({ autorizado: false, motivo: 'Token expirado' }); return;
  }

  // Verifica funcionários (admin ou funcionario)
  const funcs = await sql`SELECT id, nome_completo, role, empresa_id FROM funcionarios WHERE id=${userId} AND status='Ativo'`;
  if (funcs[0]) {
    const f = funcs[0] as any;
    const emp = f.empresa_id
      ? (await sql`SELECT nome, andar FROM empresas WHERE id=${f.empresa_id}`)[0] as any
      : null;
    await acessosSvc.create({
      pessoa_nome: f.nome_completo, pessoa_tipo: f.role,
      empresa: emp?.nome ?? null, andar: emp?.andar ?? null,
      tipo: 'Entrada', status: 'Autorizado', local: 'Catraca Principal',
    });
    res.json({ autorizado: true, nome: f.nome_completo, tipo: f.role, empresa: emp?.nome ?? null }); return;
  }

  // Verifica visitantes
  const visits = await sql`SELECT id, nome_completo, status, empresa_id FROM visitantes WHERE id=${userId}`;
  if (visits[0]) {
    const v = visits[0] as any;
    if (v.status !== 'Aprovado') {
      res.status(401).json({ autorizado: false, motivo: `Visitante com status: ${v.status}` }); return;
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
    res.json({ autorizado: true, nome: v.nome_completo, tipo: 'visitante', empresa: emp?.nome ?? null }); return;
  }

  res.status(401).json({ autorizado: false, motivo: 'Usuário não encontrado' });
};
