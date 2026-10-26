# Controle de Gastos

Aplicação web de controle de gastos usada como **projeto de estudo de infraestrutura**: Docker Compose, Nginx como proxy reverso, Node.js/Express, sessões e cache em Redis, PostgreSQL, pgAdmin e JasperReports Server.

> **Status:** projeto de estudo em andamento. O login é de demonstração (um único usuário configurado por variáveis de ambiente) e o resumo de gastos usa dados simulados para demonstrar o cache. O banco de dados já está modelado, mas ainda não alimenta as telas. Veja o [roadmap](docs/ROADMAP.md).

## Arquitetura

```text
Navegador ──► :8081  Nginx (proxy reverso)
                      ├── /pages/, /assets/ ──► web      (Nginx com os arquivos estáticos)
                      ├── /api/             ──► backend  (Node.js + Express)
                      │                          ├── Redis       (sessões, cache e limite de tentativas)
                      │                          └── PostgreSQL  (conexão verificada em /api/database/health)
                      └── /admin/           ──► pgAdmin

Navegador ──► :8080  JasperReports Server ──► PostgreSQL (banco "jasperserver")
```

Todos os serviços rodam na rede interna `backend` do Docker Compose.

## O que já funciona

- **Login com sessão no Redis**: cookie `HttpOnly`, `SameSite=Lax`, validade de 30 minutos (e `Secure` quando `NODE_ENV=production`).
- **Limite de tentativas de login**: 5 por minuto por e-mail, usando Redis. Responde `429` com `Retry-After` e cabeçalhos `X-RateLimit-*`.
- **Endpoint protegido com cache**: `/api/gastos/resumo` exige login e guarda o resultado no Redis por 30 segundos. Na primeira chamada (`X-Cache: MISS`) simula uma consulta lenta de 2 segundos. Nas seguintes (`X-Cache: HIT`) responde na hora.
- **Verificações de saúde**: `/api/health`, `/api/redis` e `/api/database/health`.
- **Banco modelado** (`init.sql`): tabelas `usuarios`, `categorias` e `gastos`, com chaves estrangeiras e índices.
- **Telas**: login, cadastro (apenas visual, ainda sem backend) e home.
- **Relatórios**: JasperReports Server com um relatório de exemplo em `reports/` (guia em [docs/JASPER.md](docs/JASPER.md)).
- **Design system em CSS** (variáveis, reset, componentes, utilitários e animações), descrito em [docs/UI.md](docs/UI.md).

## Como executar

Requisitos: [Docker](https://docs.docker.com/get-docker/) com Docker Compose v2.

```bash
git clone https://github.com/aryelderyckcandeias-jpg/controle-de-gastos.git
cd controle-de-gastos

cp .env.example .env        # edite o .env e troque todas as senhas
docker compose up -d --build
```

Acesse **http://localhost:8081**. Entre com o `DEMO_EMAIL` e a `DEMO_PASSWORD` que você definiu no `.env`.

Para gerar um `SESSION_SECRET` aleatório:

```bash
openssl rand -hex 32
```

Para parar os serviços: `docker compose down`.

> **Atenção:** `docker compose down -v` apaga os volumes, ou seja, **todos os dados do PostgreSQL**. Os scripts `init.sql` e `init-jasper.sh` só rodam quando o volume do banco está vazio.

## Variáveis de ambiente

Veja o modelo em [`.env.example`](.env.example). O `.env` real nunca deve ser versionado.

| Variável | Para que serve |
| --- | --- |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Banco da aplicação |
| `SESSION_SECRET` | Assina o cookie de sessão. **Obrigatória**: o backend não inicia sem ela |
| `DEMO_EMAIL`, `DEMO_PASSWORD` | Credenciais do login de demonstração |
| `PGADMIN_DEFAULT_EMAIL`, `PGADMIN_DEFAULT_PASSWORD` | Acesso ao pgAdmin |
| `JASPER_DB_NAME`, `JASPER_DB_USER`, `JASPER_DB_PASSWORD` | Banco do JasperReports (opcionais) |

## Endereços e portas

| Endereço | Serviço |
| --- | --- |
| http://localhost:8081 | Aplicação (Nginx) |
| http://localhost:8081/admin/ | pgAdmin |
| http://localhost:8080 | JasperReports Server |
| localhost:5432 | PostgreSQL |
| localhost:6379 | Redis |

## API

| Método e rota | Autenticação | Descrição |
| --- | --- | --- |
| `GET /api/hello` | não | Mensagem de teste do backend |
| `GET /api/health` | não | Saúde do backend e do Redis (`503` se o Redis falhar) |
| `GET /api/redis` | não | Verifica a conexão com o Redis |
| `GET /api/database/health` | não | Verifica a conexão com o PostgreSQL |
| `POST /api/login` | não | Cria a sessão (`email` e `password` no corpo JSON) |
| `GET /api/session` | não | Retorna o usuário da sessão ou `401` se não houver login |
| `POST /api/logout` | não | Encerra a sessão e apaga o cookie (`204`) |
| `GET /api/gastos/resumo` | sim | Resumo simulado, com cache de 30 s |
| `DELETE /api/cache/gastos/resumo` | sim | Limpa o cache do resumo |

## Estrutura do projeto

```text
.
├── assets/            # CSS (design system), imagens e módulos JS compartilhados
├── backend/           # API Node.js + Express (server.js, db.js, Dockerfile)
├── docs/              # CHANGELOG, ROADMAP, guia de UI e guia do JasperReports
├── pages/             # login, cadastro e home (HTML, CSS e JS de cada tela)
├── reports/           # relatórios do JasperReports (.jrxml)
├── docker-compose.yml # orquestração dos serviços
├── Dockerfile         # imagem do frontend (Nginx)
├── nginx.conf         # proxy reverso
├── init.sql           # criação das tabelas
├── init-jasper.sh     # criação do banco do JasperReports
└── .env.example       # modelo das variáveis de ambiente
```

## Segurança

O que já está aplicado: segredos fora do Git (`.env` ignorado), `SESSION_SECRET` obrigatório, cookie `HttpOnly`, limite de tentativas de login e sessões guardadas no servidor.

Para um uso além do estudo local, leia antes:

- O login é de demonstração e não consulta a tabela `usuarios`.
- As portas do PostgreSQL (5432) e do Redis (6379) ficam publicadas no `docker-compose.yml`, e o Redis não tem senha. Em um servidor, remova os `ports:` desses dois serviços.
- Use senhas fortes e diferentes no `.env`.

Os próximos passos de segurança estão no [roadmap](docs/ROADMAP.md).

## Documentação

- [Roadmap](docs/ROADMAP.md)
- [Guia de UI](docs/UI.md)
- [JasperReports Server](docs/JASPER.md)
- [Changelog](docs/CHANGELOG.md)
