# JasperReports Server — Guia e Implicações

Este documento explica o que foi adicionado para integrar o **JasperReports Server**
à aplicação **Controle de Gastos**, quais são as implicações de cada escolha e o
que mais é necessário para usá-lo.

---

## 1. O que foi adicionado

Foram feitas 4 alterações:

| Arquivo              | O que foi feito                                                            |
| -------------------- | -------------------------------------------------------------------------- |
| `docker-compose.yml` | Novo serviço `jasperserver` + variáveis `JASPER_DB_*` no serviço `postgres`. |
| `init-jasper.sh`     | Cria o usuário e o banco `jasperserver` no Postgres da aplicação (1º boot). |
| `.env.example`       | Documenta todas as variáveis, incluindo as novas do Jasper.                  |
| `docs/JASPER.md`     | Este guia.                                                                  |

### Arquitetura

```
                               ┌────────────────────────────┐
    Navegador ──► :8081/nginx  │  frontend (web), backend,  │
                               │  pgadmin                  │
                               └────────────────────────────┘

    Navegador ──► :8080 ──► jasperserver (Tomcat/Java)
                                │
                                ▼
                            postgres:5432  (banco existente)
                                ├── controle_gastos   ← dados da aplicação
                                └── jasperserver      ← repositório do Jasper (NOVO)
```

O Jasper usa o mesmo container `postgres` da aplicação, mas **um banco separado**
(`jasperserver`), para não misturar os dados da aplicação com o repositório de
relatórios.

---

## 2. Como subir

```bash
# 1. Crie o arquivo de ambiente (se ainda não existe)
cp .env.example .env

# 2. IMPORTANTE — recrie o volume do banco para o init-jasper.sh rodar.
#    Isso apaga dados existentes do Postgres (banco da aplicação + Jasper).
docker compose down -v

# 3. Suba a stack
docker compose up -d
```

> ⚠️ **Cuidado com o `docker compose down -v`**: o roteiro `init-jasper.sh` (assim
> como o `init.sql`) só roda quando o volume do Postgres está **vazio** (primeiro boot).
> Se o volume já foi criado antes, o banco `jasperserver` não existirá e o Jasper
> não conseguirá iniciar. Nesses casos, crie o banco manualmente (seção 4) ou use o
> `down -v` acima (consciente de que apaga os dados).

### Acessar

Abra no navegador:

```
http://localhost:8080/jasperserver
```

Login padrão (Community Edition):

- Usuário: `jasperadmin`
- Senha: `jasperadmin`

> O primeiro start do Jasper é demorado (o Tomcat inicializa o repositório).
> Acompanhe com `docker compose logs -f jasperserver`.

---

## 3. Implicações de cada escolha

### 3.1 Imagem: de comunidade, não a oficial

- A imagem oficial `jaspersoft/jasperserver-ce` **não existe mais no Docker Hub**
  (retorna 404). Hoje, para usar a versão oficial é preciso **buildar as imagens** a
  partir do repositório [Jaspersoft/js-docker](https://github.com/Jaspersoft/js-docker),
  o que exige baixar o instalador (WAR, vários GB), aceitar o **EULA** da Jaspersoft
  e, no caso da versão Pro, ter um arquivo de licença.
- Por isso usamos `judahpaul/jasperserver` (Community Edition 8.2.0), que é uma
  imagem pronta mantida por terceiros. **Prós** de aprender rápido; **contras**: não
  é a fonte oficial, a versão pode estar um pouco defasada e a manutenção depende do
  autor. Para um ambiente de produção, prefira as imagens oficiais buildadas.

### 3.2 Banco: reutiliza o Postgres da aplicação

- Criamos um banco **separado** (`jasperserver`) dentro do mesmo container Postgres.
- **Vantagem:** não sobe um container Postgres a mais e não mexe no banco da aplicação.
- **Ponto de atenção:** o script `init-jasper.sh` só roda no primeiro boot do volume
  (ver seção 2/4). O repositório do Jasper (relatórios, usuários, datasources) fica
  persistido nesse banco, então ele sobrevive a `docker compose down/up` (sem `-v`).

### 3.3 Escopo: só subir e acessar a interface web

- Nesta etapa o objetivo é **aprender**: abrir a UI do Jasper e explorar. O backend
  Node ainda **não** fala com a API do Jasper. Integração (gerar relatórios do backend
  via REST) é uma etapa futura.

### 3.4 Recursos (o ponto mais importante)

JasperReports Server é uma aplicação **Java/Tomcat pesada**. A imagem tem ~700 MB e,
em execução, precisa de vários GB de RAM. Configuramos:

```yaml
mem_limit: "3g"        # teto de memória do container
mem_reservation: "1g"  # reserva mínima
```

Em máquinas com pouca RAM (menos de ~8 GB), isso pode deixar o Docker lento ou
derrubar serviços. Ajuste esses valores conforme seu hardware. Como o JVM lê o limite
do container, ele escala o heap automaticamente.

### 3.5 Portas

- O Jasper publica a porta **`8080`** no host para acesso à interface.
- Já usada na stack: `8081` (nginx), `5432` (Postgres), `6379` (Redis). Portanto
  `8080` está livre por padrão. Se houver conflito, altere o lado esquerdo de
  `"8080:8080"`.

### 3.6 Segurança e licença

- **Credenciais padrão** (`jasperadmin`/`jasperadmin`) devem ser trocadas em qualquer
  ambiente que não seja só aprendizado.
- O banco `jasperserver` usa o usuário `jasper`/senha `jasperpass` **por padrão**, só
  para desenvolvimento. Ajuste no `.env`.
- A Community Edition é gratuita, mas a imagem é de terceiros; a licença oficial
  (EULA) da Jaspersoft se aplica ao software em si.

---

## 4. Criar o banco manualmente (volume já existente)

Se você já tinha o Postgres rodando (volume já inicializado) e o banco `jasperserver`
não foi criado, execute:

```bash
# Entra no shell do container Postgres
docker exec -it database-postgres bash

# (dentro do container)
su - postgres
psql -U postgres

# No prompt do psql:
CREATE ROLE jasper LOGIN PASSWORD 'jasperpass';
CREATE DATABASE jasperserver OWNER jasper;
\q
```

Depois reinicie ou suba o container do Jasper:

```bash
docker compose up -d jasperserver
```

---

## 5. Próximos passos (para aprender)

1. **Criar um Data Source** apontando para o banco `controle_gastos`
   (host `postgres`, porta `5432`, usuário/senha do `.env`). Assim você consegue
   fazer relatórios sobre as tabelas `gastos`, `categorias` e `usuarios`.
2. **Criar um relatório** simples com o Studio (ou arrastar um `.jrxml`) e publicá-lo.
3. **Conectar o backend** (Node.js) à [API REST do Jasper](https://community.jaspersoft.com/)
   para gerar/exportar relatórios programaticamente — etapa de integração.
4. Expõe o Jasper pelo **nginx** (rota `/jasperserver/`) em vez da porta direta,
   caso queira centralizar tudo na porta `8081`.

---

## 6. Comandos úteis

```bash
docker compose up -d jasperserver        # sobe só o Jasper
docker compose logs -f jasperserver      # acompanha os logs (primeiro start é lento)
docker compose restart jasperserver      # reinicia o Jasper
docker compose down                      # para tudo (preserva dados)
docker compose down -v                   # para tudo e apaga os volumes (apaga dados!)
```
