import express from "express";
import { createClient } from "redis";

/*
 * Cria a aplicação Express.
 */
const app = express();

/*
 * Configurações recebidas do Docker Compose.
 */
const PORT = Number(process.env.PORT || 3000);

const REDIS_URL =
    process.env.REDIS_URL || "redis://redis:6379";

/*
 * Permite receber JSON nas requisições.
 */
app.use(express.json());

/*
 * Cria o cliente Redis.
 *
 * Neste momento, o cliente ainda não está conectado.
 */
const redisClient = createClient({
    url: REDIS_URL
});

/*
 * Registra possíveis erros de conexão.
 */
redisClient.on("error", (error) => {
    console.error("Erro no Redis:", error.message);
});

/*
 * Tenta conectar ao Redis.
 */
try {
    await redisClient.connect();

    console.log("Backend conectado ao Redis.");
} catch (error) {
    console.error(
        "Não foi possível conectar ao Redis:",
        error.message
    );

    /*
     * Encerra o backend com código de erro.
     *
     * O Docker tentará iniciá-lo novamente por causa de:
     * restart: unless-stopped
     */
    process.exit(1);
}

/*
 * Rota inicial de teste.
 */
app.get("/api/hello", (request, response) => {
    response.json({
        message: "Olá! O backend está funcionando.",
        service: "controle-de-gastos-backend",
        date: new Date().toISOString()
    });
});

/*
 * Rota de saúde da aplicação.
 *
 * Ela verifica o backend e também envia PING ao Redis.
 */
app.get("/api/health", async (request, response) => {
    try {
        const redisResponse = await redisClient.ping();

        response.json({
            status: "online",
            backend: "healthy",
            redis: redisResponse === "PONG"
                ? "healthy"
                : "unhealthy"
        });
    } catch (error) {
        response.status(503).json({
            status: "degraded",
            backend: "healthy",
            redis: "unhealthy",
            error: error.message
        });
    }
});

/*
 * Rota específica para testar a conexão com o Redis.
 */
app.get("/api/redis", async (request, response) => {
    try {
        /*
         * Envia PING ao Redis.
         */
        const redisResponse = await redisClient.ping();

        response.json({
            status: "success",
            redis: redisResponse,
            message: "Backend conectado ao Redis."
        });
    } catch (error) {
        response.status(503).json({
            status: "error",
            redis: "offline",
            message: "Não foi possível acessar o Redis.",
            error: error.message
        });
    }
});

/*
 * Resposta para uma rota que não existe.
 */
app.use((request, response) => {
    response.status(404).json({
        message: "Rota não encontrada."
    });
});

/*
 * Inicia o servidor.
 */
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend executando na porta ${PORT}.`);
});