import { Router } from 'express';
import { validarQR } from '../controllers/iot.controller';
const r = Router();
r.post('/validar', validarQR);
export default r;
