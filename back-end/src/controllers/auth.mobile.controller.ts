import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import sql from '../config/database';

export const mobileLogin = async (req: Request, res: Response) => {
  const { email, cpf } = req.body;
  if (!email || !cpf) { res.status(400).json({ error: 'email e cpf obrigatórios' }); return; }

  const funcs = await sql`
    SELECT id, nome_completo, email, role, empresa_id, avatar_color
    FROM funcionarios WHERE email=${email} AND cpf=${cpf} AND status='Ativo'
  `;
  if (funcs[0]) {
    const f = funcs[0] as any;
    const payload = { id: f.id, nome: f.nome_completo, email: f.email, role: f.role, empresa_id: f.empresa_id, avatar_color: f.avatar_color };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' });
    res.json({ token, user: payload }); return;
  }

  const visits = await sql`
    SELECT id, nome_completo, email, cpf, status
    FROM visitantes WHERE email=${email} AND cpf=${cpf}
  `;
  if (visits[0]) {
    const v = visits[0] as any;
    const payload = { id: v.id, nome: v.nome_completo, email: v.email, role: 'visitante', visitanteStatus: v.status };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' });
    res.json({ token, user: payload }); return;
  }

  res.status(401).json({ error: 'Credenciais inválidas' });
};
