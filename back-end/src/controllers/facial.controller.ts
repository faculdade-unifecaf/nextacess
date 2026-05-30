import { Request, Response } from 'express';
import * as facialSvc from '../services/facial.service';
import * as estSvc    from '../services/estacionamento.service';
import sql            from '../config/database';

export const cadastrar = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { foto_normal_base64, foto_proxima_base64 } = req.body;
  if (!foto_normal_base64) {
    res.status(400).json({ error: 'foto_normal_base64 obrigatória' }); return;
  }
  try {
    const result = await facialSvc.cadastrarFacial(user.id, foto_normal_base64, foto_proxima_base64);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Falha ao cadastrar facial' });
  }
};

export const status = async (req: Request, res: Response) => {
  const user     = (req as any).user;
  const cadastro = await facialSvc.getFacial(user.id);
  res.json({ cadastrado: !!cadastro, criado_em: (cadastro as any)?.created_at ?? null });
};

export const remover = async (req: Request, res: Response) => {
  const user = (req as any).user;
  await facialSvc.removerFacial(user.id);
  res.status(204).end();
};

// IoT busca todos os cadastros para comparar localmente — sem auth JWT
export const listar = async (_req: Request, res: Response) => {
  const rows = await facialSvc.listarFaciais();
  res.json(rows);
};

// IoT chama quando reconhece um rosto — sem auth JWT
export const reconhecer = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  if (!user_id) { res.status(400).json({ autorizado: false, motivo: 'user_id obrigatório' }); return; }

  // Busca dados do usuário (funcionário ou visitante)
  const funcs = await sql`
    SELECT id, nome_completo, role, empresa_id FROM funcionarios WHERE id = ${user_id} AND status = 'Ativo'
  `;
  const visits = funcs.length === 0
    ? await sql`SELECT id, nome_completo, 'visitante' AS role FROM visitantes WHERE id = ${user_id}`
    : [];
  const pessoa = (funcs[0] ?? visits[0]) as any;

  if (!pessoa) {
    res.json({ autorizado: false, motivo: 'Usuário não cadastrado ou inativo' }); return;
  }

  // Verifica plano mensal ativo — valida status E vencimento
  const plano      = await estSvc.getPlano(user_id);
  const mensalista = estSvc.planoAtivo(plano);

  // Auto-expira plano vencido
  if (plano && (plano as any).status === 'ativo' && !mensalista) {
    await sql`UPDATE estacionamento_planos SET status = 'cancelado' WHERE user_id = ${user_id}`;
  }

  // Busca sessão em andamento (ativa | aguardando_pagamento | paga dentro da tolerância)
  const sessaoAtiva = await estSvc.getSessaoAtiva(user_id) as any;

  if (!sessaoAtiva) {
    // ─── ENTRADA: nenhuma sessão aberta ───
    await estSvc.iniciarSessao(user_id, null);
    return res.json({
      autorizado: true,
      acao:       'entrada',
      nome:       pessoa.nome_completo,
      mensalista,
    });
  }

  const sessaoStatus = sessaoAtiva.status;

  if (sessaoStatus === 'paga' || mensalista) {
    // ─── SAÍDA AUTORIZADA ───
    // Mensalista: fecha sessão sem custo; Pagante: sessão já foi paga, registra saída física
    await sql`
      UPDATE estacionamento_sessoes
      SET saida   = NOW(),
          status  = 'paga',
          pago_em = COALESCE(pago_em, NOW())
      WHERE id = ${sessaoAtiva.id} AND saida IS NULL
    `;
    return res.json({
      autorizado: true,
      acao:       'saida',
      nome:       pessoa.nome_completo,
      mensalista,
    });
  }

  // ─── SAÍDA BLOQUEADA: sessão ativa sem pagamento ───
  const custo = await estSvc.calcularCusto(sessaoAtiva.id);
  return res.json({
    autorizado:    false,
    acao:          'saida_bloqueada',
    nome:          pessoa.nome_completo,
    motivo:        'Pagamento pendente — finalize pelo aplicativo ou dirija-se ao balcão',
    custo_atual:   custo?.valor ?? 0,
    sessao_id:     sessaoAtiva.id,
  });
};
