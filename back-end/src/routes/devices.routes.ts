import { Router } from 'express';
import * as c from '../controllers/devices.controller';
const r = Router();
r.post('/register',   c.register);
r.post('/unregister', c.unregister);
export default r;
