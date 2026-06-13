import { Request, Response } from 'express';
import sql from '../config/database';
import * as acessosSvc from '../services/acessos.service';

// Guarda o último resultado por userId (TTL de 10s)
const recentAccess = new Map<string, { result: object; at: number }>();

// Evita registrar entrada/saída duplicada quando o QR fica parado na câmera
const lastRegister = new Map<string, number>();
const REGISTER_COOLDOWN_MS = 8000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const validarQR = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    res.status(400).json({ autorizado: false, motivo: 'Token inválido' }); return;
  }

  // ── Visitante público (formulário /cadastro) — qr_token é um UUID puro ──
  if (UUID_RE.test(token)) {
    const rows = await sql`
      SELECT v.*, e.nome AS empresa_nome, e.andar
      FROM visitantes v
      LEFT JOIN empresas e ON e.id = v.empresa_id
      WHERE v.qr_token = ${token}
    `;
    if (!rows[0]) {
      res.status(401).json({ autorizado: false, motivo: 'QR Code não encontrado' }); return;
    }
    const v = rows[0] as any;

    if (v.qr_expires_at && new Date(v.qr_expires_at) < new Date()) {
      res.status(401).json({ autorizado: false, motivo: 'QR Code expirado' }); return;
    }
    if (v.status !== 'Aprovado' && v.status !== 'Em visita') {
      res.status(401).json({ autorizado: false, motivo: `Acesso não autorizado — status: ${v.status}` }); return;
    }

    const isEntrada = v.status === 'Aprovado';
    const tipo      = isEntrada ? 'Entrada' : 'Saída';

    await acessosSvc.create({
      pessoa_nome: v.nome_completo, pessoa_tipo: 'visitante',
      empresa: v.empresa_nome ?? null, andar: v.andar ?? null,
      tipo, status: 'Autorizado', local: 'Catraca Principal',
    });

    if (isEntrada) {
      await sql`UPDATE visitantes SET status='Em visita', hora_entrada=NOW() WHERE id=${v.id}`;
    } else {
      await sql`UPDATE visitantes SET status='Saiu', hora_saida=NOW() WHERE id=${v.id}`;
    }

    res.json({ autorizado: true, nome: v.nome_completo, tipo: 'visitante', empresa: v.empresa_nome ?? null });
    return;
  }

  // ── Funcionário / visitante interno — token NEXTACCESS:userId:slot ──
  if (!token.startsWith('NEXTACCESS:')) {
    res.status(400).json({ autorizado: false, motivo: 'Token inválido' }); return;
  }

  const parts     = token.split(':');
  const userId    = parts[1];
  const slotToken = parseInt(parts[2]);
  const slotAtual = Math.floor(Date.now() / 30000);

  if (!userId || isNaN(slotToken) || Math.abs(slotAtual - slotToken) > 1) {
    res.status(401).json({ autorizado: false, motivo: 'Token expirado' }); return;
  }

  // Cooldown — QR parado na câmera não registra entrada/saída repetida
  const ultimoRegistro = lastRegister.get(userId);
  if (ultimoRegistro && Date.now() - ultimoRegistro < REGISTER_COOLDOWN_MS) {
    const cache = recentAccess.get(userId);
    res.json(cache?.result ?? { autorizado: true, repetido: true }); return;
  }

  // Verifica funcionários
  const funcs = await sql`SELECT id, nome_completo, role, empresa_id FROM funcionarios WHERE id=${userId} AND status='Ativo'`;
  if (funcs[0]) {
    const f   = funcs[0] as any;
    const emp = f.empresa_id
      ? (await sql`SELECT nome, andar FROM empresas WHERE id=${f.empresa_id}`)[0] as any
      : null;
    // Alterna entrada/saída com base no último acesso do funcionário
    const ultimo = await sql`
      SELECT tipo FROM acessos
      WHERE pessoa_nome=${f.nome_completo} AND status='Autorizado'
      ORDER BY data_hora DESC LIMIT 1`;
    const tipoFunc = (ultimo[0] as any)?.tipo === 'Entrada' ? 'Saída' : 'Entrada';
    await acessosSvc.create({
      pessoa_nome: f.nome_completo, pessoa_tipo: f.role,
      empresa: emp?.nome ?? null, andar: emp?.andar ?? null,
      tipo: tipoFunc, status: 'Autorizado', local: 'Catraca Principal',
    });
    const result = { autorizado: true, nome: f.nome_completo, tipo: f.role, acao: tipoFunc, empresa: emp?.nome ?? null };
    recentAccess.set(userId, { result, at: Date.now() });
    lastRegister.set(userId, Date.now());
    res.json(result); return;
  }

  // Verifica visitantes internos (cadastrados pela recepção ou via app)
  const visits = await sql`SELECT id, nome_completo, status, empresa_id FROM visitantes WHERE id=${userId}`;
  if (visits[0]) {
    const v = visits[0] as any;
    if (v.status !== 'Aprovado' && v.status !== 'Em visita') {
      const result = { autorizado: false, motivo: `Visitante com status: ${v.status}` };
      recentAccess.set(userId, { result, at: Date.now() });
      res.status(401).json(result); return;
    }
    const emp = v.empresa_id
      ? (await sql`SELECT nome, andar FROM empresas WHERE id=${v.empresa_id}`)[0] as any
      : null;
    const isEntrada = v.status === 'Aprovado';
    const tipo      = isEntrada ? 'Entrada' : 'Saída';
    await acessosSvc.create({
      pessoa_nome: v.nome_completo, pessoa_tipo: 'visitante',
      empresa: emp?.nome ?? null, andar: emp?.andar ?? null,
      tipo, status: 'Autorizado', local: 'Catraca Principal',
    });
    if (isEntrada) {
      await sql`UPDATE visitantes SET status='Em visita', hora_entrada=NOW() WHERE id=${v.id}`;
    } else {
      await sql`UPDATE visitantes SET status='Saiu', hora_saida=NOW() WHERE id=${v.id}`;
    }
    const result = { autorizado: true, nome: v.nome_completo, tipo: 'visitante', acao: tipo, empresa: emp?.nome ?? null };
    recentAccess.set(userId, { result, at: Date.now() });
    lastRegister.set(userId, Date.now());
    res.json(result); return;
  }

  res.status(401).json({ autorizado: false, motivo: 'Usuário não encontrado' });
};

// Mobile faz polling neste endpoint
export const consultarAcesso = (req: Request, res: Response) => {
  const userId = req.params['userId'] as string;
  const entry = recentAccess.get(userId);
  if (!entry || Date.now() - entry.at > 10000) {
    res.json({ novo: false }); return;
  }
  recentAccess.delete(userId); // consome o evento — não repete
  res.json({ novo: true, ...entry.result });
};
