import express from "express";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

import {
    checkDatabaseConnection,
    closeDatabase
} from "./db.js";
/*
 * Configurações da aplicação.
 */
const PORT = Number(process.env.PORT || 3000);

const REDIS_URL =
    process.env.REDIS_URL || "redis://redis:6379";

const SESSION_SECRET =
    process.env.SESSION_SECRET;

const DEMO_EMAIL =
    process.env.DEMO_EMAIL || "aluno@email.com";

const DEMO_PASSWORD =
    process.env.DEMO_PASSWORD || "123456";

const CACHE_KEY = "cache:gastos:resumo";
const CACHE_TTL_SECONDS = 30;

/*
 * Configurações do rate limiting.
 *
 * Máximo de 5 tentativas dentro de 60 segundos.
 */
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;
const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 60;

/*
 * Não inicia sem o segredo da sessão.
 */
if (!SESSION_SECRET) {
    console.error(
        "A variável SESSION_SECRET não foi configurada."
    );

    process.exit(1);
}

/*
 * Cria o backend Express.
 */
const app = express();

/*
 * Informa que existe um proxy Nginx na frente.
 */
app.set("trust proxy", 1);

/*
 * Permite receber JSON.
 */
app.use(express.json());

/*
 * Cria o cliente Redis.
 */
const redisClient = createClient({
    url: REDIS_URL
});

redisClient.on("error", (error) => {
    console.error("Erro no Redis:", error.message);
});

/*
 * Conecta ao Redis.
 */
try {
    await redisClient.connect();

    console.log("Backend conectado ao Redis.");
} catch (error) {
    console.error(
        "Não foi possível conectar ao Redis:",
        error.message
    );

    process.exit(1);
}

/*
 * =====================================================
 * CONEXÃO COM POSTGRESQL
 * =====================================================
 */

try {

    const database =
        await checkDatabaseConnection();


    console.log(
        "Backend conectado ao PostgreSQL."
    );


    console.log(
        "Horário do PostgreSQL:",
        database.now
    );

} catch (error) {

    console.error(
        "Não foi possível conectar ao PostgreSQL:",
        error.message
    );


    await redisClient.quit();

    await closeDatabase();

    process.exit(1);

}


/*
 * =====================================================
 * SAÚDE DO POSTGRESQL
 * =====================================================
 */

app.get(
    "/api/database/health",
    async (request, response) => {

        try {

            const database =
                await checkDatabaseConnection();


            response.json({

                status: "online",

                database:
                    "postgresql",

                connected:
                    true,

                serverTime:
                    database.now

            });

        } catch (error) {

            console.error(
                "Erro ao verificar PostgreSQL:",
                error.message
            );


            response.status(503).json({

                status:
                    "offline",

                database:
                    "postgresql",

                connected:
                    false,

                message:
                    "Não foi possível conectar ao PostgreSQL."

            });

        }

    }
);

/*
 * Cria o armazenamento de sessões no Redis.
 */
const redisStore = new RedisStore({
    client: redisClient,
    prefix: "session:"
});

/*
 * Configura as sessões.
 */
app.use(
    session({
        /*
         * As sessões serão guardadas no Redis.
         */
        store: redisStore,

        /*
         * Nome do cookie no navegador.
         */
        name: "controle.sid",

        /*
         * Segredo utilizado para assinar o cookie.
         */
        secret: SESSION_SECRET,

        /*
         * Não salva novamente se nada mudou.
         */
        resave: false,

        /*
         * Não cria sessão para visitantes
         * que ainda não fizeram login.
         */
        saveUninitialized: false,

        /*
         * Configurações do cookie.
         */
        cookie: {
            /*
             * Impede o JavaScript da página
             * de ler diretamente o cookie.
             */
            httpOnly: true,

            /*
             * Ajuda na proteção contra requisições
             * vindas de outros sites.
             */
            sameSite: "lax",

            /*
             * Em produção, com HTTPS, será true.
             * Em localhost com HTTP, precisa ser false.
             */
            secure:
                process.env.NODE_ENV === "production",

            /*
             * Sessão dura 30 minutos.
             */
            maxAge: 30 * 60 * 1000
        }
    })
);

/*
 * Simula uma operação demorada.
 */
function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

/*
 * Script Lua executado dentro do Redis.
 *
 * Ele realiza três operações:
 *
 * 1. Incrementa o contador
 * 2. Define o TTL na primeira tentativa
 * 3. Retorna contador e TTL
 */
const loginRateLimitScript = `
    local attempts = redis.call(
        "INCR",
        KEYS[1]
    )

    if attempts == 1 then
        redis.call(
            "EXPIRE",
            KEYS[1],
            ARGV[1]
        )
    end

    local ttl = redis.call(
        "TTL",
        KEYS[1]
    )

    return { attempts, ttl }
`;

/*
 * Registra uma tentativa de login.
 */
async function registerLoginAttempt(email) {
    /*
     * Normaliza o e-mail.
     *
     * ALUNO@EMAIL.COM
     * vira:
     * aluno@email.com
     */
    const normalizedEmail =
        email.trim().toLowerCase();

    /*
     * Cria o nome da chave.
     */
    const key =
        `rate_limit:login:${normalizedEmail}`;

    /*
     * Executa o script no Redis.
     */
    const result = await redisClient.eval(
        loginRateLimitScript,
        {
            keys: [key],

            arguments: [
                String(
                    LOGIN_RATE_LIMIT_WINDOW_SECONDS
                )
            ]
        }
    );

    /*
     * O Redis retorna:
     *
     * result[0] = número de tentativas
     * result[1] = TTL
     */
    const attempts = Number(result[0]);
    const ttl = Number(result[1]);

    const remainingAttempts = Math.max(
        0,
        LOGIN_RATE_LIMIT_MAX_ATTEMPTS -
            attempts
    );

    return {
        key,
        attempts,
        ttl,

        allowed:
            attempts <=
            LOGIN_RATE_LIMIT_MAX_ATTEMPTS,

        remainingAttempts
    };
}
/*
 * Middleware que protege uma rota.
 */
function requireAuthentication(
    request,
    response,
    next
) {
    if (!request.session.user) {
        return response.status(401).json({
            authenticated: false,
            message: "Você precisa fazer login."
        });
    }

    next();
}

/*
 * Rota inicial.
 */
app.get("/api/hello", (request, response) => {
    response.json({
        message: "Olá! O backend está funcionando.",
        service: "controle-de-gastos-backend",
        date: new Date().toISOString()
    });
});

/*
 * Saúde do backend e Redis.
 */
app.get("/api/health", async (request, response) => {
    try {
        const redisResponse =
            await redisClient.ping();

        response.json({
            status: "online",
            backend: "healthy",
            redis:
                redisResponse === "PONG"
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
 * Teste do Redis.
 */
app.get("/api/redis", async (request, response) => {
    try {
        const redisResponse =
            await redisClient.ping();

        response.json({
            status: "success",
            redis: redisResponse,
            message: "Backend conectado ao Redis."
        });
    } catch (error) {
        response.status(503).json({
            status: "error",
            redis: "offline",
            message:
                "Não foi possível acessar o Redis.",
            error: error.message
        });
    }
});

/*
 * LOGIN COM RATE LIMITING
 */
app.post(
    "/api/login",
    async (request, response) => {
        const { email, password } =
            request.body;

        /*
         * Validação dos campos.
         */
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return response.status(400).json({
                message:
                    "E-mail e senha são obrigatórios."
            });
        }

        let rateLimit;

        try {
            /*
             * Registra uma tentativa no Redis.
             */
            rateLimit =
                await registerLoginAttempt(email);
        } catch (error) {
            console.error(
                "Erro no rate limiting:",
                error
            );

            return response.status(503).json({
                message:
                    "Não foi possível validar as tentativas de login."
            });
        }

        /*
         * Adiciona informações de limite
         * nos cabeçalhos HTTP.
         */
        response.set({
            "X-RateLimit-Limit":
                String(
                    LOGIN_RATE_LIMIT_MAX_ATTEMPTS
                ),

            "X-RateLimit-Remaining":
                String(
                    rateLimit.remainingAttempts
                ),

            "X-RateLimit-Reset":
                String(rateLimit.ttl)
        });

        /*
         * Se passou do limite, responde HTTP 429.
         */
        if (!rateLimit.allowed) {
            response.set(
                "Retry-After",
                String(rateLimit.ttl)
            );

            return response.status(429).json({
                message:
                    `Muitas tentativas de login. ` +
                    `Tente novamente em ` +
                    `${rateLimit.ttl} segundos.`,

                attempts:
                    rateLimit.attempts,

                retryAfterSeconds:
                    rateLimit.ttl
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const validEmail =
            normalizedEmail ===
            DEMO_EMAIL.trim().toLowerCase();

        const validPassword =
            password === DEMO_PASSWORD;

        /*
         * Credenciais incorretas.
         */
        if (!validEmail || !validPassword) {
            return response.status(401).json({
                message:
                    `E-mail ou senha incorretos. ` +
                    `Restam ` +
                    `${rateLimit.remainingAttempts} ` +
                    `tentativa(s).`,

                attempts:
                    rateLimit.attempts,

                remainingAttempts:
                    rateLimit.remainingAttempts
            });
        }

        /*
         * Login correto.
         *
         * Remove o contador de tentativas.
         */
        await redisClient.del(
            rateLimit.key
        );

        /*
         * Cria a sessão.
         */
        request.session.user = {
            id: 1,
            name: "Aluno",
            email: DEMO_EMAIL
        };

        request.session.loggedAt =
            new Date().toISOString();

        /*
         * Salva a sessão no Redis.
         */
        request.session.save((error) => {
            if (error) {
                console.error(
                    "Erro ao salvar a sessão:",
                    error
                );

                return response
                    .status(500)
                    .json({
                        message:
                            "Não foi possível criar a sessão."
                    });
            }

            response.json({
                message:
                    "Login realizado com sucesso.",

                user:
                    request.session.user
            });
        });
    }
);

/*
 * CONSULTAR SESSÃO
 */
app.get("/api/session", (request, response) => {
    if (!request.session.user) {
        return response.status(401).json({
            authenticated: false,
            message: "Usuário não autenticado."
        });
    }

    response.json({
        authenticated: true,
        user: request.session.user,
        loggedAt: request.session.loggedAt
    });
});

/*
 * LOGOUT
 *
 * Remove a sessão do Redis.
 */
app.post("/api/logout", (request, response) => {
    request.session.destroy((error) => {
        if (error) {
            console.error(
                "Erro ao destruir a sessão:",
                error
            );

            return response.status(500).json({
                message:
                    "Não foi possível encerrar a sessão."
            });
        }

        response.clearCookie(
            "controle.sid",
            {
                path: "/"
            }
        );

        response.status(204).end();
    });
});

/*
 * RESUMO DE GASTOS COM CACHE
 *
 * Agora a rota exige autenticação.
 */
app.get(
    "/api/gastos/resumo",
    requireAuthentication,
    async (request, response) => {
        const startTime = Date.now();

        response.set(
            "Cache-Control",
            "no-store"
        );

        try {
            const cachedValue =
                await redisClient.get(CACHE_KEY);

            /*
             * Cache HIT.
             */
            if (cachedValue) {
                const duration =
                    Date.now() - startTime;

                response.set("X-Cache", "HIT");

                return response.json({
                    cache: "HIT",
                    source: "redis",
                    message:
                        "Dados encontrados no Redis.",
                    durationMilliseconds: duration,
                    data: JSON.parse(cachedValue)
                });
            }

            /*
             * Cache MISS.
             *
             * Simula consulta ao PostgreSQL.
             */
            await wait(2000);

            const data = {
                totalGastos: Number(
                    (
                        1000 +
                        Math.random() * 1000
                    ).toFixed(2)
                ),

                quantidadeGastos:
                    Math.floor(
                        Math.random() * 20
                    ) + 1,

                generatedAt:
                    new Date().toISOString()
            };

            /*
             * Salva por 30 segundos.
             */
            await redisClient.set(
                CACHE_KEY,
                JSON.stringify(data),
                {
                    EX: CACHE_TTL_SECONDS
                }
            );

            const duration =
                Date.now() - startTime;

            response.set("X-Cache", "MISS");

            return response.json({
                cache: "MISS",
                source: "backend",
                message:
                    "Dados gerados pelo backend e salvos no Redis.",
                durationMilliseconds: duration,
                cacheExpiresInSeconds:
                    CACHE_TTL_SECONDS,
                data
            });
        } catch (error) {
            console.error(
                "Erro ao consultar o cache:",
                error
            );

            return response.status(500).json({
                status: "error",
                message:
                    "Não foi possível consultar o cache.",
                error: error.message
            });
        }
    }
);

/*
 * LIMPAR CACHE
 *
 * Também exige autenticação.
 */
app.delete(
    "/api/cache/gastos/resumo",
    requireAuthentication,
    async (request, response) => {
        response.set(
            "Cache-Control",
            "no-store"
        );

        try {
            const removedKeys =
                await redisClient.del(CACHE_KEY);

            response.json({
                status: "success",
                cacheRemoved: removedKeys > 0,
                removedKeys,
                message:
                    removedKeys > 0
                        ? "Cache removido com sucesso."
                        : "O cache já estava vazio."
            });
        } catch (error) {
            console.error(
                "Erro ao remover o cache:",
                error
            );

            response.status(500).json({
                status: "error",
                message:
                    "Não foi possível remover o cache.",
                error: error.message
            });
        }
    }
);

/*
 * Rota inexistente.
 */
app.use((request, response) => {
    response.status(404).json({
        message: "Rota não encontrada."
    });
});

/*
 * Inicia o backend.
 */
app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Backend executando na porta ${PORT}.`
    );
});
