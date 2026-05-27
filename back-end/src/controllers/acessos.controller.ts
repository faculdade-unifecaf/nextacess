import { Request, Response } from 'express';
import * as svc from '../services/acessos.service';

export const list   = async (req: Request, res: Response) => {
  const { tipo, status, data } = req.query as Record<string, string>;
  res.json(await svc.findAll(tipo, status, data));
};
export const create = async (req: Request, res: Response) => {
  const { pessoa_nome, pessoa_tipo, tipo, status } = req.body;
  if (!pessoa_nome || !pessoa_tipo || !tipo || !status) {
    res.status(400).json({ error: 'pessoa_nome, pessoa_tipo, tipo e status obrigatórios' }); return;
  }
  res.status(201).json(await svc.create(req.body));
};
