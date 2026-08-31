#!/bin/bash
#
# ==============================================================
# INIT — JASPERREPORTS SERVER
#
# Cria o usuário e o banco de repositório do JasperReports
# Server dentro do Postgres já existente da aplicação.
#
# Este script é executado automaticamente pelo entrypoint da
# imagem postgres (postgres:13) somente quando o volume de
# dados ainda está vazio (primeiro boot). Se o volume já foi
# inicializado antes, ele NÃO roda novamente — veja a
# documentação em docs/JASPER.md para reaplicar manualmente.
#
# As credenciais são lidas das variáveis de ambiente, que vêm
# do docker-compose.yml (preenchidas pelo arquivo .env).
# ==============================================================
set -e

# ==============================================================
# VARIÁVEIS (com padrão para facilitar o primeiro uso)
# ==============================================================
JASPER_DB_USER="${JASPER_DB_USER:-jasper}"
JASPER_DB_PASSWORD="${JASPER_DB_PASSWORD:-jasperpass}"
JASPER_DB_NAME="${JASPER_DB_NAME:-jasperserver}"

echo "JasperReports: criando usuário '${JASPER_DB_USER}' no Postgres..."

# Cria o usuário somente se ainda não existir.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (
            SELECT FROM pg_catalog.pg_roles
            WHERE rolname = '${JASPER_DB_USER}'
        ) THEN
            CREATE ROLE ${JASPER_DB_USER} LOGIN PASSWORD '${JASPER_DB_PASSWORD}';
        END IF;
    END
    \$\$;
EOSQL

echo "JasperReports: criando banco '${JASPER_DB_NAME}'..."

# Cria o banco somente se ainda não existir.
# O truque \gexec executa o resultado da consulta abaixo
# (CREATE DATABASE ...) apenas quando o banco não existe.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE ${JASPER_DB_NAME} OWNER ${JASPER_DB_USER}'
    WHERE NOT EXISTS (
        SELECT FROM pg_database WHERE datname = '${JASPER_DB_NAME}'
    )\gexec
EOSQL

echo "JasperReports: banco '${JASPER_DB_NAME}' pronto para uso."
