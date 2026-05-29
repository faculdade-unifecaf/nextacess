import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' })); // fotos base64 chegam antes do upload pro Storage
app.use(helmet());

app.use('/api', routes);

app.use((_: any, res: any) => res.status(404).json({ error: 'Rota não encontrada' }));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: err.message ?? 'Erro interno' });
});

export default app;