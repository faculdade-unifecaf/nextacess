import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { stripeWebhook } from './controllers/estacionamento.controller';

const app = express();

app.use(cors({ origin: '*' }));
app.use(helmet());

// Stripe exige raw body para verificar assinatura — registrado antes do express.json()
app.post('/api/estacionamento/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json({ limit: '10mb' }));

app.use('/api', routes);

app.use((_: any, res: any) => res.status(404).json({ error: 'Rota não encontrada' }));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: err.message ?? 'Erro interno' });
});

export default app;