import { Request, Response } from 'express';
import * as svc from '../services/visitante.publico.service';

export const listarEmpresas = async (_req: Request, res: Response) => {
  res.json(await svc.listarEmpresas());
};

export const cadastrar = async (req: Request, res: Response) => {
  const { nome_completo, cpf, email, empresa_id, motivo, data_visita } = req.body;
  if (!nome_completo || !cpf || !email || !empresa_id || !motivo || !data_visita) {
    res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    return;
  }
  try {
    const visitante = await svc.cadastrar(req.body);
    res.status(201).json(visitante);
  } catch (err: any) {
    res.status(err?.code === 'CPF_DUPLICADO' ? 409 : 500).json({ error: err?.message ?? 'Erro interno ao cadastrar visitante.' });
  }
};

export const validarToken = async (req: Request, res: Response) => {
  const token = req.params['token'] as string;
  res.json(await svc.validarToken(token));
};
