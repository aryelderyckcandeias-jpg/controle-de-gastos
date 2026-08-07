import pg from "pg";

const {
    Pool
} = pg;


/*
 * =====================================================
 * CONFIGURAÇÃO DO POSTGRESQL
 * =====================================================
 */

const databaseHost =
    process.env.POSTGRES_HOST || "postgres";

const databasePort =
    Number(
        process.env.POSTGRES_PORT || 5432
    );

const databaseName =
    process.env.POSTGRES_DB;

const databaseUser =
    process.env.POSTGRES_USER;

const databasePassword =
    process.env.POSTGRES_PASSWORD;


/*
 * =====================================================
 * VALIDAÇÃO
 * =====================================================
 */

if (
    !databaseName ||
    !databaseUser ||
    !databasePassword
) {

    console.error(
        "As variáveis do PostgreSQL não foram configuradas."
    );

    process.exit(1);

}


/*
 * =====================================================
 * POOL DE CONEXÕES
 * =====================================================
 */

export const pool =
    new Pool({

        host:
            databaseHost,

        port:
            databasePort,

        database:
            databaseName,

        user:
            databaseUser,

        password:
            databasePassword,

        max: 10,

        idleTimeoutMillis:
            30_000,

        connectionTimeoutMillis:
            5_000

    });


/*
 * =====================================================
 * ERROS DO POOL
 * =====================================================
 */

pool.on(
    "error",
    (error) => {

        console.error(
            "Erro inesperado no PostgreSQL:",
            error.message
        );

    }
);


/*
 * =====================================================
 * TESTE DE CONEXÃO
 * =====================================================
 */

export async function checkDatabaseConnection() {

    const result =
        await pool.query(
            "SELECT NOW() AS now"
        );


    return result.rows[0];

}


/*
 * =====================================================
 * ENCERRAMENTO
 * =====================================================
 */

export async function closeDatabase() {

    await pool.end();

}