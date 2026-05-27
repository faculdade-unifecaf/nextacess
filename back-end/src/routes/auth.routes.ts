import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { mobileLogin } from '../controllers/auth.mobile.controller';
const r = Router();
r.post('/login', login);
r.post('/app-login', mobileLogin);
export default r;
