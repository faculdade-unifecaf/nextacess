import { Request, Response } from 'express';
import * as svc from '../services/chat.service';

export const getMensagens = async (req: Request, res: Response) => {
  res.json(await svc.getMensagens(req.params['empresa_id'] as string));
};
export const sendMensagem = async (req: Request, res: Response) => {
  const { from_role, texto } = req.body;
  if (!from_role || !texto) { res.status(400).json({ error: 'from_role e texto obrigatórios' }); return; }
  const msg = await svc.sendMensagem(req.params['empresa_id'] as string, from_role, texto, (req as any).user?.id);
  res.status(201).json(msg);
};
