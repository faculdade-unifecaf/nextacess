import 'dotenv/config';
import app from "./app";
import sql from "./config/database";
import * as push           from "./services/push.service";
import * as estacionamento from "./services/estacionamento.service";

const PORT = 3000

async function testarConexao() {
    try {
        await sql`SELECT 1`;
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        await push.ensureSchema();
        console.log('✅ Tabela device_tokens pronta.');
        await estacionamento.ensureSchema();
        console.log('✅ Tabelas de estacionamento e facial prontas.');
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:', error);
    }
}

testarConexao();

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT} 🚀`);
});
