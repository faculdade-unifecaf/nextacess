import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const login = (req: Request, res: Response) => {
  const { email, senha } = req.body;
  if (!email || !senha) { res.status(400).json({ error: 'email e senha obrigatórios' }); return; }
  if (email !== process.env.ADMIN_EMAIL || senha !== process.env.ADMIN_SENHA) {
    res.status(401).json({ error: 'Credenciais inválidas' }); return;
  }
  const token = jwt.sign({ email, role: 'recepcionista' }, process.env.JWT_SECRET!, { expiresIn: '8h' });
  res.json({ token });
};
