import Stripe from 'stripe';
import sql from '../config/database';

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY não configurado');
  return new Stripe(key);
};

/* ─── Schema ─── */
export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS estacionamento_tarifas (
      id INT PRIMARY KEY DEFAULT 1,
      valor_hora          NUMERIC(10,2) NOT NULL DEFAULT 10.00,
      valor_diaria        NUMERIC(10,2) NOT NULL DEFAULT 60.00,
      valor_mensalidade   NUMERIC(10,2) NOT NULL DEFAULT 300.00,
      tolerancia_minutos  INT           NOT NULL DEFAULT 20,
      updated_at          TIMESTAMPTZ            DEFAULT NOW()
    )
  `;
  await sql`INSERT INTO estacionamento_tarifas (id) VALUES (1) ON CONFLICT DO NOTHING`;

  await sql`
    CREATE TABLE IF NOT EXISTS estacionamento_veiculos (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    TEXT         NOT NULL,
      placa      VARCHAR(10)  NOT NULL,
      modelo     VARCHAR(100),
      tipo       VARCHAR(10)  DEFAULT 'carro',
      cor        VARCHAR(50),
      ativo      BOOLEAN      DEFAULT TRUE,
      created_at TIMESTAMPTZ  DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS estacionamento_sessoes (
      id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id            TEXT         NOT NULL,
      veiculo_id         UUID,
      entrada            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      saida              TIMESTAMPTZ,
      pago_em            TIMESTAMPTZ,
      valor_cobrado      NUMERIC(10,2),
      status             VARCHAR(30)  DEFAULT 'ativa',
      origem_pagamento   VARCHAR(20)  DEFAULT 'app',
      stripe_session_id  TEXT,
      stripe_payment_id  TEXT,
      created_at         TIMESTAMPTZ  DEFAULT NOW()
    )
  `;

  // Migrações seguras para bancos já existentes
  await sql`ALTER TABLE estacionamento_sessoes ADD COLUMN IF NOT EXISTS pago_em TIMESTAMPTZ`;
  await sql`ALTER TABLE estacionamento_sessoes ADD COLUMN IF NOT EXISTS origem_pagamento VARCHAR(20) DEFAULT 'app'`;
  await sql`ALTER TABLE estacionamento_sessoes ADD COLUMN IF NOT EXISTS stripe_session_id TEXT`;
  await sql`ALTER TABLE estacionamento_sessoes ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS estacionamento_planos (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id           TEXT         NOT NULL UNIQUE,
      status            VARCHAR(20)  DEFAULT 'ativo',
      inicio            DATE         NOT NULL DEFAULT CURRENT_DATE,
      vencimento        DATE         NOT NULL,
      valor             NUMERIC(10,2) NOT NULL,
      stripe_payment_id TEXT,
      created_at        TIMESTAMPTZ  DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE estacionamento_planos ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS facial_cadastros (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id          TEXT        NOT NULL UNIQUE,
      foto_base64      TEXT,
      foto_url_normal  TEXT,
      foto_url_proxima TEXT,
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      updated_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE facial_cadastros ALTER COLUMN foto_base64 DROP NOT NULL`;
  await sql`ALTER TABLE facial_cadastros ADD COLUMN IF NOT EXISTS foto_url_normal  TEXT`;
  await sql`ALTER TABLE facial_cadastros ADD COLUMN IF NOT EXISTS foto_url_proxima TEXT`;
}

/* ─── Tarifas ─── */
export const getTarifas = async () =>
  (await sql`SELECT * FROM estacionamento_tarifas WHERE id = 1`)[0] ?? null;

export const updateTarifas = async (d: any) =>
  (await sql`
    UPDATE estacionamento_tarifas
    SET valor_hora         = ${d.valor_hora},
        valor_diaria       = ${d.valor_diaria},
        valor_mensalidade  = ${d.valor_mensalidade},
        tolerancia_minutos = ${d.tolerancia_minutos},
        updated_at         = NOW()
    WHERE id = 1
    RETURNING *
  `)[0];

/* ─── Veículos ─── */
export const getVeiculos = async (user_id: string) =>
  sql`SELECT * FROM estacionamento_veiculos WHERE user_id = ${user_id} AND ativo = TRUE ORDER BY created_at DESC`;

export const addVeiculo = async (user_id: string, d: any) =>
  (await sql`
    INSERT INTO estacionamento_veiculos (user_id, placa, modelo, tipo, cor)
    VALUES (${user_id}, ${d.placa.toUpperCase()}, ${d.modelo ?? null}, ${d.tipo ?? 'carro'}, ${d.cor ?? null})
    RETURNING *
  `)[0];

export const deleteVeiculo = async (id: string, user_id: string) =>
  sql`UPDATE estacionamento_veiculos SET ativo = FALSE WHERE id = ${id} AND user_id = ${user_id}`;

/* ─── Sessões ─── */

export const getSessaoAtiva = async (user_id: string) =>
  (await sql`
    SELECT s.*, v.placa, v.modelo, v.tipo AS veiculo_tipo
    FROM estacionamento_sessoes s
    LEFT JOIN estacionamento_veiculos v ON v.id = s.veiculo_id
    WHERE s.user_id = ${user_id}
      AND s.saida IS NULL
      AND (
        s.status IN ('ativa', 'aguardando_pagamento')
        OR (
          s.status = 'paga'
          AND s.pago_em IS NOT NULL
          AND s.pago_em + (
            SELECT tolerancia_minutos FROM estacionamento_tarifas WHERE id = 1
          ) * INTERVAL '1 minute' > NOW()
        )
      )
    ORDER BY s.entrada DESC LIMIT 1
  `)[0] ?? null;

export const iniciarSessao = async (user_id: string, veiculo_id: string | null) =>
  (await sql`
    INSERT INTO estacionamento_sessoes (user_id, veiculo_id)
    VALUES (${user_id}, ${veiculo_id})
    RETURNING *
  `)[0];

export const registrarSaida = async (sessao_id: string) =>
  sql`
    UPDATE estacionamento_sessoes
    SET saida = NOW()
    WHERE id = ${sessao_id} AND saida IS NULL
  `;

export const calcularCusto = async (sessao_id: string) => {
  const sessao  = (await sql`SELECT * FROM estacionamento_sessoes WHERE id = ${sessao_id}`)[0] as any;
  const tarifas = await getTarifas() as any;
  if (!sessao || !tarifas) return null;

  const fim      = sessao.pago_em ?? new Date();
  const minutos  = Math.ceil((new Date(fim).getTime() - new Date(sessao.entrada).getTime()) / 60000);
  const horas    = Math.ceil(minutos / 60);
  const valorBruto = horas * Number(tarifas.valor_hora);
  const valor    = Math.min(valorBruto, Number(tarifas.valor_diaria));
  return { sessao_id, minutos, horas, valor, tarifas };
};

/* ─── Pagamento via Stripe Checkout ─── */
export const criarStripeCheckout = async (sessao_id: string, user_email: string) => {
  const custo = await calcularCusto(sessao_id);
  if (!custo) throw new Error('Sessão não encontrada');

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user_email,
    line_items: [{
      price_data: {
        currency: 'brl',
        product_data: { name: 'Estacionamento NextAccess' },
        unit_amount: Math.round(custo.valor * 100),
      },
      quantity: 1,
    }],
    success_url: `${process.env.APP_URL ?? 'academia://'}pagamento/sucesso`,
    cancel_url:  `${process.env.APP_URL ?? 'academia://'}pagamento/cancelado`,
    metadata: { sessao_id },
  });

  await sql`
    UPDATE estacionamento_sessoes
    SET status = 'aguardando_pagamento', stripe_session_id = ${session.id}, valor_cobrado = ${custo.valor}
    WHERE id = ${sessao_id}
  `;

  return { checkout_url: session.url!, valor: custo.valor };
};

export const confirmarPagamento = async (stripe_payment_id: string, sessao_id: string) => {
  await sql`
    UPDATE estacionamento_sessoes
    SET status = 'paga', stripe_payment_id = ${stripe_payment_id}, pago_em = NOW(), origem_pagamento = 'app'
    WHERE id = ${sessao_id} AND status != 'paga'
  `;
};

export const registrarPagamentoBalcao = async (sessao_id: string) => {
  const sessao = (await sql`SELECT * FROM estacionamento_sessoes WHERE id = ${sessao_id}`)[0] as any;
  if (!sessao) throw new Error('Sessão não encontrada');
  if (['paga', 'cancelada'].includes(sessao.status)) throw new Error('Sessão já encerrada');

  const custo = await calcularCusto(sessao_id);
  if (!custo) throw new Error('Não foi possível calcular o custo');

  await sql`
    UPDATE estacionamento_sessoes
    SET status = 'paga', valor_cobrado = ${custo.valor}, pago_em = NOW(), origem_pagamento = 'balcao'
    WHERE id = ${sessao_id}
  `;

  return { sessao_id, valor: custo.valor };
};

export const getSessoes = async (user_id?: string) => {
  if (user_id) {
    return sql`
      SELECT s.*, v.placa, v.modelo
      FROM estacionamento_sessoes s
      LEFT JOIN estacionamento_veiculos v ON v.id = s.veiculo_id
      WHERE s.user_id = ${user_id}
      ORDER BY s.entrada DESC LIMIT 50
    `;
  }
  return sql`
    SELECT
      s.*,
      v.placa,
      v.modelo,
      COALESCE(f.nome_completo, vis.nome_completo)                    AS nome_usuario,
      COALESCE(f.email,         vis.email)                          AS email_usuario,
      CASE WHEN f.id IS NOT NULL THEN f.role::TEXT ELSE 'visitante' END AS role_usuario
    FROM estacionamento_sessoes s
    LEFT JOIN estacionamento_veiculos v   ON v.id   = s.veiculo_id
    LEFT JOIN funcionarios            f   ON f.id::TEXT  = s.user_id
    LEFT JOIN visitantes              vis ON vis.id::TEXT = s.user_id
    ORDER BY s.entrada DESC LIMIT 200
  `;
};

/* ─── Planos (mensalidade) ─── */
export const getPlano = async (user_id: string) =>
  (await sql`SELECT * FROM estacionamento_planos WHERE user_id = ${user_id}`)[0] ?? null;

export const criarStripeCheckoutPlano = async (user_id: string, user_email: string) => {
  const tarifas = await getTarifas() as any;
  const stripe  = getStripe();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user_email,
    line_items: [{
      price_data: {
        currency: 'brl',
        product_data: { name: 'Mensalidade Estacionamento NextAccess' },
        unit_amount: Math.round(Number(tarifas.valor_mensalidade) * 100),
      },
      quantity: 1,
    }],
    success_url: `${process.env.APP_URL ?? 'academia://'}pagamento/sucesso`,
    cancel_url:  `${process.env.APP_URL ?? 'academia://'}pagamento/cancelado`,
    metadata: { tipo: 'mensalidade', user_id },
  });

  return { checkout_url: session.url!, valor: tarifas.valor_mensalidade };
};

export const confirmarPlano = async (user_id: string, stripe_payment_id: string) => {
  const tarifas    = await getTarifas() as any;
  const vencimento = new Date();
  vencimento.setMonth(vencimento.getMonth() + 1);

  await sql`
    INSERT INTO estacionamento_planos (user_id, vencimento, valor, stripe_payment_id)
    VALUES (${user_id}, ${vencimento.toISOString().split('T')[0]!}, ${tarifas.valor_mensalidade}, ${stripe_payment_id})
    ON CONFLICT (user_id) DO UPDATE
    SET status            = 'ativo',
        vencimento        = ${vencimento.toISOString().split('T')[0]!},
        stripe_payment_id = ${stripe_payment_id}
  `;
};

/* ─── Verificação ativa de pagamento (consulta Stripe diretamente) ─── */
export const verificarPagamentoStripe = async (sessao_id: string) => {
  const sessao = (await sql`SELECT * FROM estacionamento_sessoes WHERE id = ${sessao_id}`)[0] as any;
  if (!sessao) throw new Error('Sessão não encontrada');
  if (sessao.status === 'paga') return { status: 'paga', valor: Number(sessao.valor_cobrado) };
  if (!sessao.stripe_session_id) throw new Error('Sessão ainda não tem checkout iniciado');

  const stripe  = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessao.stripe_session_id as string);

  if (session.payment_status === 'paid') {
    const paymentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent as any)?.id ?? session.id;
    await confirmarPagamento(paymentId, sessao_id);
    return { status: 'paga', valor: Number(sessao.valor_cobrado) };
  }

  return { status: session.payment_status };
};

/* ─── Simulação (bypass para desenvolvimento) ─── */
export const simularPagamento = async (sessao_id: string) => {
  const sessao = (await sql`SELECT * FROM estacionamento_sessoes WHERE id = ${sessao_id}`)[0] as any;
  if (!sessao) throw new Error('Sessão não encontrada');
  if (['paga', 'cancelada'].includes(sessao.status)) throw new Error('Sessão já encerrada');

  const custo = await calcularCusto(sessao_id);
  if (!custo) throw new Error('Não foi possível calcular o custo');

  await sql`
    UPDATE estacionamento_sessoes
    SET status            = 'paga',
        valor_cobrado     = ${custo.valor},
        pago_em           = NOW(),
        origem_pagamento  = 'simulado',
        stripe_payment_id = ${'SIM-' + Date.now()}
    WHERE id = ${sessao_id}
  `;

  return { sessao_id, valor: custo.valor };
};

/* ─── Dashboard ─── */
export const getDashboard = async () => {
  const hoje = new Date().toISOString().split('T')[0]!;

  const [mensalistas, entradas_hoje, faturamento_hoje, sessoes_ativas] = await Promise.all([
    sql`SELECT COUNT(*) AS total FROM estacionamento_planos WHERE status = 'ativo'`,
    sql`SELECT COUNT(*) AS total FROM estacionamento_sessoes WHERE DATE(entrada) = ${hoje}`,
    sql`SELECT COALESCE(SUM(valor_cobrado), 0) AS total FROM estacionamento_sessoes WHERE DATE(entrada) = ${hoje} AND status = 'paga'`,
    sql`SELECT COUNT(*) AS total FROM estacionamento_sessoes WHERE saida IS NULL AND status IN ('ativa', 'aguardando_pagamento', 'paga')`,
  ]);

  return {
    mensalistas:      Number((mensalistas[0]     as any).total),
    entradas_hoje:    Number((entradas_hoje[0]   as any).total),
    faturamento_hoje: Number((faturamento_hoje[0] as any).total),
    sessoes_ativas:   Number((sessoes_ativas[0]  as any).total),
  };
};
