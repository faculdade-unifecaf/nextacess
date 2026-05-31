import 'dotenv/config';
import app from './app';
import sql from './config/database';
import * as push           from './services/push.service';
import * as estacionamento from './services/estacionamento.service';
import { migrate as migrateVisitantePublico } from './services/visitante.publico.service';

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  try {
    await sql`SELECT 1`;
    console.log('✅ Banco conectado.');
    await push.ensureSchema();
    await estacionamento.ensureSchema();
    await migrateVisitantePublico();
    console.log('✅ Schemas prontos.');
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
    process.exit(1);
  }
}

bootstrap().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor na porta ${PORT}`);
  });
});
