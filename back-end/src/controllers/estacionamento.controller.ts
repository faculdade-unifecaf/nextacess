import { Request, Response } from 'express';
import * as svc from '../services/estacionamento.service';

export const getTarifas = async (_req: Request, res: Response) => {
  res.json(await svc.getTarifas());
};

export const updateTarifas = async (req: Request, res: Response) => {
  const { valor_hora, valor_diaria, valor_mensalidade, tolerancia_minutos } = req.body;
  if (!valor_hora || !valor_diaria || !valor_mensalidade) {
    res.status(400).json({ error: 'Campos obrigatórios: valor_hora, valor_diaria, valor_mensalidade' }); return;
  }
  res.json(await svc.updateTarifas({ valor_hora, valor_diaria, valor_mensalidade, tolerancia_minutos: tolerancia_minutos ?? 20 }));
};

export const getVeiculos = async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json(await svc.getVeiculos(user.id));
};

export const addVeiculo = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { placa, modelo, tipo, cor } = req.body;
  if (!placa) { res.status(400).json({ error: 'Placa obrigatória' }); return; }
  res.status(201).json(await svc.addVeiculo(user.id, { placa, modelo, tipo, cor }));
};

export const deleteVeiculo = async (req: Request, res: Response) => {
  const user = (req as any).user;
  await svc.deleteVeiculo(req.params.id, user.id);
  res.status(204).end();
};

export const getSessaoAtiva = async (req: Request, res: Response) => {
  const user   = (req as any).user;
  const sessao = await svc.getSessaoAtiva(user.id) as any;
  if (!sessao) { res.json(null); return; }

  // Para sessões pagas: usa valor_cobrado já registrado + calcula tolerância restante
  if (sessao.status === 'paga') {
    const tarifas = await svc.getTarifas() as any;
    const pagoMs  = new Date(sessao.pago_em).getTime();
    const toleranciaMs = Number(tarifas.tolerancia_minutos) * 60 * 1000;
    const tolerancia_restante_segundos = Math.max(0, Math.ceil((pagoMs + toleranciaMs - Date.now()) / 1000));
    return res.json({ ...sessao, custo_atual: Number(sessao.valor_cobrado ?? 0), tolerancia_restante_segundos });
  }

  // Para sessões ativas/aguardando: calcula custo corrente
  const custo = await svc.calcularCusto(sessao.id);
  res.json({ ...sessao, custo_atual: custo?.valor ?? 0 });
};

export const getSessoes = async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json(await svc.getSessoes(user.id));
};

export const iniciarSessao = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { veiculo_id } = req.body;

  const ativa = await svc.getSessaoAtiva(user.id);
  if (ativa) { res.status(409).json({ error: 'Já existe uma sessão em andamento' }); return; }

  res.status(201).json(await svc.iniciarSessao(user.id, veiculo_id ?? null));
};

export const pagarSessao = async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const result = await svc.criarPreferenciaPagamento(req.params.id, user.email);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

// Pagamento registrado pela recepção (balcão) — admin only
export const pagarBalcao = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== 'recepcionista' && user.role !== 'admin') {
    res.status(403).json({ error: 'Apenas recepção pode registrar pagamento no balcão' }); return;
  }
  try {
    const result = await svc.registrarPagamentoBalcao(req.params.id);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

// Webhook do Mercado Pago — sem auth JWT (chamado pelo MP)
export const webhook = async (req: Request, res: Response) => {
  const { type, data } = req.body;
  res.status(200).end(); // responde imediatamente ao MP

  if (type !== 'payment') return;

  try {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const payment = await mpRes.json() as any;

    if (payment.status === 'approved') {
      const paymentId = String(payment.id); // ID verificado da API do MP, não do body
      const sessao_id = payment.metadata?.sessao_id;
      if (sessao_id) {
        await svc.confirmarPagamento(paymentId, sessao_id);
      }
      // Plano mensal
      const user_id = payment.metadata?.user_id;
      const tipo    = payment.metadata?.tipo;
      if (tipo === 'mensalidade' && user_id) {
        await svc.confirmarPlano(user_id, paymentId);
      }
    }
  } catch (e) {
    console.error('[Webhook MP]', e);
  }
};

export const getPlano = async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json(await svc.getPlano(user.id));
};

export const assinarPlano = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!['admin', 'funcionario'].includes(user.role)) {
    res.status(403).json({ error: 'Apenas funcionários e admins podem assinar mensalidade' }); return;
  }
  try {
    res.json(await svc.assinarPlano(user.id, user.email));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getDashboard = async (_req: Request, res: Response) => {
  res.json(await svc.getDashboard());
};

export const getAllSessoes = async (_req: Request, res: Response) => {
  res.json(await svc.getSessoes());
};
