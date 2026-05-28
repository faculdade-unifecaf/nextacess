import { Request, Response } from 'express';
import * as push from '../services/push.service';

// O usuário autenticado vem do middleware auth (req.user)
export const register = async (req: Request, res: Response) => {
  const { token } = req.body;
  const user = (req as any).user;
  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'token obrigatório' }); return;
  }
  if (!user?.id || !user?.role) {
    res.status(401).json({ error: 'Não autenticado' }); return;
  }
  await push.registerToken(token, user.id, user.role, user.empresa_id ?? null);
  res.status(201).json({ ok: true });
};

export const unregister = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) { res.status(400).json({ error: 'token obrigatório' }); return; }
  await push.removeToken(token);
  res.status(204).end();
};
