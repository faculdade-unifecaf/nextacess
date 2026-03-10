import app from "./app";
import sql from "./config/database";

const PORT = 3000

async function testarConexao() {
    try {
        await sql`SELECT 1`;
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:', error);
    }
}

testarConexao();

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT} 🚀`);
});
