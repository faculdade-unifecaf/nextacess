import { Router } from 'express';
import { auth } from '../middleware/auth';
import authRoutes        from './auth.routes';
import empresasRoutes    from './empresas.routes';
import funcionariosRoutes from './funcionarios.routes';
import visitantesRoutes  from './visitantes.routes';
import avisosRoutes      from './avisos.routes';
import acessosRoutes     from './acessos.routes';
import chatRoutes        from './chat.routes';

const router = Router();

router.use('/auth',         authRoutes);
router.use('/empresas',     auth, empresasRoutes);
router.use('/funcionarios', auth, funcionariosRoutes);
router.use('/visitantes',   auth, visitantesRoutes);
router.use('/avisos',       auth, avisosRoutes);
router.use('/acessos',      auth, acessosRoutes);
router.use('/chat',         auth, chatRoutes);

export default router;
