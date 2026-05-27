import { Router } from 'express';
import { validarQR, consultarAcesso } from '../controllers/iot.controller';
const r = Router();
r.post('/validar',        validarQR);
r.get('/acesso/:userId',  consultarAcesso);   // sem auth — mobile faz polling
export default r;
