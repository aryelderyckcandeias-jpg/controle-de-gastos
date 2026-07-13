# Usa uma imagem oficial do Nginx (servidor web leve e rápido)
FROM nginx:alpine

# Copia TODOS os arquivos da sua pasta para a pasta do Nginx
# O ponto (.) significa: "tudo que está aqui na pasta atual"
# /usr/share/nginx/html é onde o Nginx procura os arquivos para mostrar
COPY . /usr/share/nginx/html

# Diz que a aplicação vai usar a porta 80 (porta padrão HTTP)
EXPOSE 80

# Quando o container iniciar, ele rodará este comando
# que inicia o servidor Nginx
CMD ["nginx", "-g", "daemon off;"]