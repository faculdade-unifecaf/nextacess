import { Router } from 'express';
import { auth } from '../middleware/auth';
import authRoutes         from './auth.routes';
import publicoRoutes      from './visitante.publico.routes';
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
const router = Router();

router.use('/auth',           authRoutes);
router.use('/publico',        publicoRoutes); // sem autenticação — acesso público
router.use('/iot',            iotRoutes);
router.use('/facial',         facialRoutes);
router.use('/estacionamento', auth, estacionamentoRoutes);
router.use('/empresas',       auth, empresasRoutes);
router.use('/funcionarios',   auth, funcionariosRoutes);
router.use('/visitantes',     auth, visitantesRoutes);
router.use('/avisos',         auth, avisosRoutes);
router.use('/acessos',        auth, acessosRoutes);
router.use('/chat',           auth, chatRoutes);
router.use('/devices',        auth, devicesRoutes);

export default router;
