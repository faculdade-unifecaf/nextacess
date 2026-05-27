import { Request, Response } from 'express';
import * as svc from '../services/funcionarios.service';

export const list   = async (_req: Request, res: Response) => { res.json(await svc.findAll()); };
export const get    = async (req: Request, res: Response) => {
  const r = await svc.findById(req.params['id'] as string);
  r ? res.json(r) : res.status(404).json({ error: 'Não encontrado' });
};
export const create = async (req: Request, res: Response) => {
  const { nome_completo, cpf, email } = req.body;
  if (!nome_completo || !cpf || !email) {
    res.status(400).json({ error: 'nome_completo, cpf e email obrigatórios' }); return;
  }
  res.status(201).json(await svc.create(req.body));
};
export const update = async (req: Request, res: Response) => {
  const r = await svc.update(req.params['id'] as string, req.body);
  r ? res.json(r) : res.status(404).json({ error: 'Não encontrado' });
};
export const updateStatus = async (req: Request, res: Response) => {
  if (!req.body.status) { res.status(400).json({ error: 'status obrigatório' }); return; }
  const r = await svc.updateStatus(req.params['id'] as string, req.body.status as string);
  r ? res.json(r) : res.status(404).json({ error: 'Não encontrado' });
};
export const remove = async (req: Request, res: Response) => {
  const r = await svc.remove(req.params['id'] as string);
  r ? res.status(204).end() : res.status(404).json({ error: 'Não encontrado' });
};
