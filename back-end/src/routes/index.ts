import { Router } from 'express';
import { auth } from '../middleware/auth';
import authRoutes         from './auth.routes';
import empresasRoutes     from './empresas.routes';
import funcionariosRoutes from './funcionarios.routes';
import visitantesRoutes   from './visitantes.routes';
import avisosRoutes       from './avisos.routes';
import acessosRoutes      from './acessos.routes';
import chatRoutes         from './chat.routes';
import iotRoutes            from './iot.routes';
import devicesRoutes        from './devices.routes';
import estacionamentoRoutes from './estacionamento.routes';
import facialRoutes         from './facial.routes';
import { webhook }          from '../controllers/estacionamento.controller';

const router = Router();

router.use('/auth',           authRoutes);
router.use('/iot',            iotRoutes);
router.use('/facial',         facialRoutes);
router.post('/estacionamento/webhook', webhook);       // MP webhook sem auth
router.use('/estacionamento', auth, estacionamentoRoutes);
router.use('/empresas',       auth, empresasRoutes);
router.use('/funcionarios',   auth, funcionariosRoutes);
router.use('/visitantes',     auth, visitantesRoutes);
router.use('/avisos',         auth, avisosRoutes);
router.use('/acessos',        auth, acessosRoutes);
router.use('/chat',           auth, chatRoutes);
router.use('/devices',        auth, devicesRoutes);

export default router;
