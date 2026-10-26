# Roadmap

Próximos passos do projeto, em ordem de prioridade. Os itens marcados foram identificados na revisão do código e ainda não foram implementados.

## 1. Autenticação de verdade

- [ ] Cadastro de usuários no backend (a tela de cadastro hoje não chama nenhuma API).
- [ ] Login consultando a tabela `usuarios`, com senha guardada como hash (argon2 ou bcrypt) na coluna `senha_hash`.
- [ ] Remover o login de demonstração e os valores padrão `aluno@email.com` / `123456` do `server.js`.
- [ ] Remover o `INSERT` do usuário `admin@email.com` sem senha do `init.sql`.

## 2. Gastos de verdade

- [ ] Endpoints para criar, listar, editar e excluir gastos e categorias, sempre filtrando pelo usuário logado.
- [ ] Trocar a consulta simulada de `/api/gastos/resumo` por uma consulta real ao PostgreSQL, mantendo o cache no Redis.
- [ ] Ligar a tela `home` aos endpoints reais.
- [ ] Usar o relatório `reports/relatorio_gastos_cliente.jrxml` com dados reais.

## 3. Segurança e LGPD

- [ ] Validar e sanitizar toda entrada do backend.
- [ ] Cabeçalhos de segurança (por exemplo, com `helmet`) e proteção contra CSRF nas rotas que alteram dados.
- [ ] Não publicar as portas do PostgreSQL e do Redis; definir senha no Redis.
- [ ] Fixar a versão das imagens Docker (hoje `judahpaul/jasperserver:latest` e `dpage/pgadmin4` sem versão).
- [ ] HTTPS no Nginx para uso fora de localhost.
- [ ] LGPD: política de privacidade, exportação e exclusão da conta e dos dados do usuário.

## 4. Qualidade

- [ ] Testes automatizados do backend (login, limite de tentativas, autorização).
- [ ] Pipeline de CI: verificação de sintaxe, testes, varredura de segredos e de dependências.
- [ ] Preencher ou remover os arquivos vazios em `assets/js/` e o `validations.js` da raiz, que hoje não é usado.

## 5. Interface

- [ ] Tornar a tela de cadastro funcional.
- [ ] Revisar acessibilidade (contraste, foco visível, navegação por teclado) e o layout em celular.
