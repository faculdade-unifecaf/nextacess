import { Router } from 'express';
import * as c from '../controllers/visitante.publico.controller';

const r = Router();

r.get('/empresas',          c.listarEmpresas);
r.post('/cadastro',         c.cadastrar);
r.get('/validar/:token',    c.validarToken);

export default r;
