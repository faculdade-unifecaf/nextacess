import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(helmet());

app.use('/api', routes);

app.use((_: any, res: any) => res.status(404).json({ error: 'Rota não encontrada' }));

export default app;