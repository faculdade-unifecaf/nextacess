import { Request, Response } from 'express';
import * as svc from '../services/avisos.service';

export const list   = async (_req: Request, res: Response) => { res.json(await svc.findAll()); };
export const create = async (req: Request, res: Response) => {
  const { titulo, mensagem, data_inicio } = req.body;
  if (!titulo || !mensagem || !data_inicio) {
    res.status(400).json({ error: 'titulo, mensagem e data_inicio obrigatórios' }); return;
  }
  res.status(201).json(await svc.create(req.body));
};
export const update = async (req: Request, res: Response) => {
  const r = await svc.update(req.params['id'] as string, req.body);
  r ? res.json(r) : res.status(404).json({ error: 'Não encontrado' });
};
export const remove = async (req: Request, res: Response) => {
  const r = await svc.remove(req.params['id'] as string);
  r ? res.status(204).end() : res.status(404).json({ error: 'Não encontrado' });
};
