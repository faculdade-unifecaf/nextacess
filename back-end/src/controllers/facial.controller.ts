import { Request, Response } from 'express';
import * as facialSvc from '../services/facial.service';
import * as estSvc    from '../services/estacionamento.service';
import sql            from '../config/database';

export const cadastrar = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { foto_base64 } = req.body;
  if (!foto_base64) { res.status(400).json({ error: 'foto_base64 obrigatória' }); return; }
  res.status(201).json(await facialSvc.cadastrarFacial(user.id, foto_base64));
};

export const status = async (req: Request, res: Response) => {
  const user = (req as any).user;
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

  // Busca dados do usuário
  const funcs = await sql`
    SELECT id, nome_completo, role, empresa_id FROM funcionarios WHERE id = ${user_id} AND status = 'Ativo'
  `;
  const visits = funcs.length === 0
    ? await sql`SELECT id, nome_completo, 'visitante' AS role FROM visitantes WHERE id = ${user_id}`
    : [];
  const pessoa = (funcs[0] ?? visits[0]) as any;

  if (!pessoa) {
    res.json({ autorizado: false, motivo: 'Usuário não encontrado' }); return;
  }

  // Verifica plano mensal (funcionario/admin)
  const plano = await estSvc.getPlano(user_id);
  const mensalista = plano && (plano as any).status === 'ativo';

  // Sessão ativa?
  const sessaoAtiva = await estSvc.getSessaoAtiva(user_id);

  if (!sessaoAtiva) {
    // ENTRADA: inicia sessão
    await estSvc.iniciarSessao(user_id, null);
    res.json({
      autorizado: true,
      acao: 'entrada',
      nome: pessoa.nome_completo,
      mensalista,
    });
  } else {
    const status = (sessaoAtiva as any).status;

    if (status === 'paga' || mensalista) {
      // SAÍDA autorizada
      if (mensalista) {
        await sql`UPDATE estacionamento_sessoes SET status = 'paga', saida = NOW() WHERE id = ${(sessaoAtiva as any).id}`;
      }
      res.json({
        autorizado: true,
        acao: 'saida',
        nome: pessoa.nome_completo,
        mensalista,
      });
    } else {
      // Sessão ativa mas não paga — bloqueia saída
      res.json({
        autorizado: false,
        acao: 'saida_bloqueada',
        nome: pessoa.nome_completo,
        motivo: 'Pagamento pendente — finalize pelo aplicativo',
      });
    }
  }
};
