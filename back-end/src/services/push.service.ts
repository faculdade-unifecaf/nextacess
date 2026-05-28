import sql from '../config/database';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Cria a tabela de tokens caso ainda não exista (sem sistema de migrations)
export const ensureSchema = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS device_tokens (
      token       TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      role        TEXT NOT NULL,
      empresa_id  UUID,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
};

// Registra/atualiza o token de um dispositivo (idempotente por token)
export const registerToken = async (
  token: string,
  user_id: string,
  role: string,
  empresa_id: string | null,
) =>
  sql`
    INSERT INTO device_tokens (token, user_id, role, empresa_id, updated_at)
    VALUES (${token}, ${user_id}, ${role}, ${empresa_id}, now())
    ON CONFLICT (token) DO UPDATE
      SET user_id = ${user_id}, role = ${role}, empresa_id = ${empresa_id}, updated_at = now()
  `;

export const removeToken = (token: string) =>
  sql`DELETE FROM device_tokens WHERE token = ${token}`;

// Remove tokens que o Expo reportou como inválidos (DeviceNotRegistered)
const pruneTokens = async (tokens: string[]) => {
  if (tokens.length) await sql`DELETE FROM device_tokens WHERE token IN ${sql(tokens)}`;
};

// Envia para o serviço de push do Expo (em lotes de 100, limite da API)
const dispatch = async (tokens: string[], payload: PushPayload) => {
  if (!tokens.length) return;

  const messages = tokens.map(to => ({
    to,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
    channelId: 'default',
  }));

  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(batch),
      });
      const json: any = await res.json();
      const tickets: any[] = json?.data ?? [];
      // marca tokens inválidos para remoção
      const invalid = tickets
        .map((t, idx) => (t?.details?.error === 'DeviceNotRegistered' ? batch[idx]!.to : null))
        .filter((x): x is string => !!x);
      await pruneTokens(invalid);
    } catch (err) {
      console.error('[push] falha ao enviar lote:', err);
    }
  }
};

// Notifica todos os dispositivos de um conjunto de roles
export const sendToRoles = async (roles: string[], payload: PushPayload) => {
  if (!roles.length) return;
  const rows = await sql`SELECT token FROM device_tokens WHERE role IN ${sql(roles)}`;
  await dispatch(rows.map((r: any) => r.token), payload);
};

// Notifica todos os admins de uma empresa específica
export const sendToEmpresaAdmins = async (empresa_id: string, payload: PushPayload) => {
  const rows = await sql`
    SELECT token FROM device_tokens WHERE empresa_id = ${empresa_id} AND role = 'admin'
  `;
  await dispatch(rows.map((r: any) => r.token), payload);
};
