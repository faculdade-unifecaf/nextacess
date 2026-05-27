import { Router } from 'express';
import * as c from '../controllers/acessos.controller';
const r = Router();
r.get('/',  c.list);
r.post('/', c.create);
export default r;
