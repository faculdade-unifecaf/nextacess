import { Request, Response } from 'express';
import Stripe from 'stripe';
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
  await svc.deleteVeiculo(req.params['id'] as string, user.id);
  res.status(204).end();
};

export const getSessaoAtiva = async (req: Request, res: Response) => {
  const user   = (req as any).user;
  const sessao = await svc.getSessaoAtiva(user.id) as any;
  if (!sessao) { res.json(null); return; }

  if (sessao.status === 'paga') {
    const tarifas = await svc.getTarifas() as any;
    const pagoMs  = new Date(sessao.pago_em).getTime();
    const toleranciaMs = Number(tarifas.tolerancia_minutos) * 60 * 1000;
    const tolerancia_restante_segundos = Math.max(0, Math.ceil((pagoMs + toleranciaMs - Date.now()) / 1000));
    return res.json({ ...sessao, custo_atual: Number(sessao.valor_cobrado ?? 0), tolerancia_restante_segundos });
  }

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
    const result = await svc.criarStripeCheckout(req.params['id'] as string, user.email);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const pagarBalcao = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== 'recepcionista' && user.role !== 'admin') {
    res.status(403).json({ error: 'Apenas recepção pode registrar pagamento no balcão' }); return;
  }
  try {
    const result = await svc.registrarPagamentoBalcao(req.params['id'] as string);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

// Webhook do Stripe — sem auth JWT, registrado no app.ts com raw body
export const stripeWebhook = async (req: Request, res: Response) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;

  if (webhookSecret) {
    const sigHeader = req.headers['stripe-signature'];
    if (!sigHeader) { res.status(400).json({ error: 'Header stripe-signature ausente' }); return; }
    const sig = Array.isArray(sigHeader) ? sigHeader[0]! : sigHeader;
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } catch (e: any) {
      res.status(400).json({ error: `Webhook signature inválida: ${e.message}` }); return;
    }
  } else {
    // Sem secret configurado: aceita o body direto (dev local sem Stripe CLI)
    try { event = JSON.parse(req.body.toString()); } catch { res.status(400).end(); return; }
  }

  res.status(200).end();

  try {
    if (event.type === 'checkout.session.completed') {
      const session   = event.data.object as { payment_intent: string | { id: string } | null; id: string; metadata?: Record<string, string> | null };
      const paymentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent as any)?.id ?? session.id;

      const sessao_id = session.metadata?.sessao_id;
      if (sessao_id) await svc.confirmarPagamento(paymentId, sessao_id);

      const user_id = session.metadata?.user_id;
      const tipo    = session.metadata?.tipo;
      if (tipo === 'mensalidade' && user_id) await svc.confirmarPlano(user_id, paymentId);
    }
  } catch (e) {
    console.error('[Webhook Stripe]', e);
  }
};

export const verificarPagamento = async (req: Request, res: Response) => {
  try {
    const result = await svc.verificarPagamentoStripe(req.params['id'] as string);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
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
    res.json(await svc.criarStripeCheckoutPlano(user.id, user.email));
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

export const simularPagamento = async (req: Request, res: Response) => {
  try {
    const result = await svc.simularPagamento(req.params['id'] as string);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
