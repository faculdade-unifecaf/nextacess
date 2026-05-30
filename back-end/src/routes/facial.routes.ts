import { Router } from 'express';
import { auth } from '../middleware/auth';
import * as c from '../controllers/facial.controller';

const r = Router();

r.post('/cadastrar', auth, c.cadastrar);
r.get('/status',     auth, c.status);
r.delete('/remover', auth, c.remover);
r.get('/lista',            c.listar);       // IoT — sem auth
r.post('/reconhecer',      c.reconhecer);   // IoT — sem auth

export default r;
