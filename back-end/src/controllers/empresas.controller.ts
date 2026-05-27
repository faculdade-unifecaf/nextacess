import { Request, Response } from 'express';
import * as svc from '../services/empresas.service';

export const list   = async (_req: Request, res: Response) => { res.json(await svc.findAll()); };
export const get    = async (req: Request, res: Response) => {
  const r = await svc.findById(req.params['id'] as string);
  r ? res.json(r) : res.status(404).json({ error: 'Não encontrado' });
};
export const create = async (req: Request, res: Response) => {
  if (!req.body.nome) { res.status(400).json({ error: 'nome obrigatório' }); return; }
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
