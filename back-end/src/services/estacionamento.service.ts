import sql from '../config/database';

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
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id          TEXT         NOT NULL,
      veiculo_id       UUID,
      entrada          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      saida            TIMESTAMPTZ,
      pago_em          TIMESTAMPTZ,
      valor_cobrado    NUMERIC(10,2),
      status           VARCHAR(30)  DEFAULT 'ativa',
      origem_pagamento VARCHAR(20)  DEFAULT 'app',
      mp_preference_id TEXT,
      mp_payment_id    TEXT,
      created_at       TIMESTAMPTZ  DEFAULT NOW()
    )
  `;

  // Migração segura para bancos já existentes
  await sql`ALTER TABLE estacionamento_sessoes ADD COLUMN IF NOT EXISTS pago_em TIMESTAMPTZ`;
  await sql`ALTER TABLE estacionamento_sessoes ADD COLUMN IF NOT EXISTS origem_pagamento VARCHAR(20) DEFAULT 'app'`;

  await sql`
    CREATE TABLE IF NOT EXISTS estacionamento_planos (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       TEXT         NOT NULL UNIQUE,
      status        VARCHAR(20)  DEFAULT 'ativo',
      inicio        DATE         NOT NULL DEFAULT CURRENT_DATE,
      vencimento    DATE         NOT NULL,
      valor         NUMERIC(10,2) NOT NULL,
      mp_payment_id TEXT,
      created_at    TIMESTAMPTZ  DEFAULT NOW()
    )
  `;

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

  // Migração segura para tabelas já existentes
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

// Retorna sessão em andamento: ativa, aguardando pagamento, ou paga dentro da janela de tolerância
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

// Registra saída física (chamado pelo IoT ao reconhecer rosto na saída)
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

  const fim       = sessao.pago_em ?? new Date(); // se já pagou, calcula até o momento do pagamento
  const minutos   = Math.ceil((new Date(fim).getTime() - new Date(sessao.entrada).getTime()) / 60000);
  const horas     = Math.ceil(minutos / 60);
  const valorBruto = horas * Number(tarifas.valor_hora);
  const valor     = Math.min(valorBruto, Number(tarifas.valor_diaria));
  return { sessao_id, minutos, horas, valor, tarifas };
};

export const criarPreferenciaPagamento = async (sessao_id: string, user_email: string, user_cpf?: string | null) => {
  const custo = await calcularCusto(sessao_id);
  if (!custo) throw new Error('Sessão não encontrada');

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');

  const body = {
    items: [{
      title:      'Estacionamento NextAccess',
      quantity:   1,
      unit_price: custo.valor,
      currency_id: 'BRL',
    }],
    payer: {
      // Em sandbox o email real conflita com conta MP existente — usa email de teste
      email: token.startsWith('TEST-') ? 'test_user@testuser.com' : user_email,
      ...(user_cpf ? { identification: { type: 'CPF', number: user_cpf.replace(/\D/g, '') } } : {}),
    },
    back_urls: {
      success: `${process.env.APP_URL ?? 'https://nextaccess.app'}/pagamento/sucesso`,
      failure: `${process.env.APP_URL ?? 'https://nextaccess.app'}/pagamento/erro`,
      pending: `${process.env.APP_URL ?? 'https://nextaccess.app'}/pagamento/pendente`,
    },
    notification_url: `${process.env.BACKEND_URL ?? 'http://localhost:3000'}/api/estacionamento/webhook`,
    metadata: { sessao_id },
    auto_return: 'approved',
  };

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body:    JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`MP erro ${res.status}: ${await res.text()}`);
  const pref = await res.json() as any;
  if (!pref.id || !pref.init_point) throw new Error('Resposta inválida do Mercado Pago');

  await sql`
    UPDATE estacionamento_sessoes
    SET status = 'aguardando_pagamento', mp_preference_id = ${pref.id}, valor_cobrado = ${custo.valor}
    WHERE id = ${sessao_id}
  `;

  return { init_point: pref.init_point, sandbox_init_point: pref.sandbox_init_point ?? null, valor: custo.valor };
};

// Pagamento confirmado pelo webhook do MP — não seta saida (saída física vem do IoT)
export const confirmarPagamento = async (mp_payment_id: string, sessao_id: string) => {
  await sql`
    UPDATE estacionamento_sessoes
    SET status = 'paga', mp_payment_id = ${mp_payment_id}, pago_em = NOW(), origem_pagamento = 'app'
    WHERE id = ${sessao_id} AND status != 'paga'
  `;
};

// Pagamento registrado manualmente pela recepção (sem gateway)
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
  // Para o admin-web: inclui nome/email do usuário via JOIN nas duas tabelas de usuários
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

export const assinarPlano = async (user_id: string, user_email: string) => {
  const tarifas = await getTarifas() as any;
  const token   = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');

  const body = {
    items: [{ title: 'Mensalidade Estacionamento NextAccess', quantity: 1, unit_price: Number(tarifas.valor_mensalidade), currency_id: 'BRL' }],
    payer: { email: user_email },
    notification_url: `${process.env.BACKEND_URL ?? 'http://localhost:3000'}/api/estacionamento/webhook`,
    metadata: { tipo: 'mensalidade', user_id },
  };

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`MP erro ${res.status}`);
  const data = await res.json() as any;

  return { init_point: data.init_point, sandbox_init_point: data.sandbox_init_point ?? null, valor: tarifas.valor_mensalidade };
};

export const confirmarPlano = async (user_id: string, mp_payment_id: string) => {
  const tarifas    = await getTarifas() as any;
  const vencimento = new Date();
  vencimento.setMonth(vencimento.getMonth() + 1);

  await sql`
    INSERT INTO estacionamento_planos (user_id, vencimento, valor, mp_payment_id)
    VALUES (${user_id}, ${vencimento.toISOString().split('T')[0]}, ${tarifas.valor_mensalidade}, ${mp_payment_id})
    ON CONFLICT (user_id) DO UPDATE
    SET status        = 'ativo',
        vencimento    = ${vencimento.toISOString().split('T')[0]},
        mp_payment_id = ${mp_payment_id}
  `;
};

/* ─── Dashboard ─── */
export const getDashboard = async () => {
  const hoje = new Date().toISOString().split('T')[0];

  const [mensalistas, entradas_hoje, faturamento_hoje, sessoes_ativas] = await Promise.all([
    sql`SELECT COUNT(*) AS total FROM estacionamento_planos WHERE status = 'ativo'`,
    sql`SELECT COUNT(*) AS total FROM estacionamento_sessoes WHERE DATE(entrada) = ${hoje}`,
    sql`SELECT COALESCE(SUM(valor_cobrado), 0) AS total FROM estacionamento_sessoes WHERE DATE(entrada) = ${hoje} AND status = 'paga'`,
    // Conta como "ativas" todas as sessões sem saída registrada
    sql`SELECT COUNT(*) AS total FROM estacionamento_sessoes WHERE saida IS NULL AND status IN ('ativa', 'aguardando_pagamento', 'paga')`,
  ]);

  return {
    mensalistas:      Number((mensalistas[0]   as any).total),
    entradas_hoje:    Number((entradas_hoje[0]  as any).total),
    faturamento_hoje: Number((faturamento_hoje[0] as any).total),
    sessoes_ativas:   Number((sessoes_ativas[0] as any).total),
  };
};
