# Changelog

## [Adicionado] JasperReports Server (relatórios)

- Novo serviço `jasperserver` no `docker-compose.yml` (imagem de comunidade `judahpaul/jasperserver`, Community Edition 8.2.0).
- Script `init-jasper.sh` cria o banco `jasperserver` e o usuário `jasper` no Postgres da aplicação (primeiro boot).
- Variáveis `JASPER_DB_USER`, `JASPER_DB_PASSWORD`, `JASPER_DB_NAME` adicionadas ao `.env.example`.
- Documentação de uso e implicações em `docs/JASPER.md`.
