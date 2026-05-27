import { Router } from 'express';
import * as c from '../controllers/chat.controller';
const r = Router();
r.get('/:empresa_id',  c.getMensagens);
r.post('/:empresa_id', c.sendMensagem);
export default r;
