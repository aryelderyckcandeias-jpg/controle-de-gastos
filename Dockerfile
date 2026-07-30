# Imagem que servirá os arquivos HTML/CSS/JS
FROM nginx:alpine

# Copia os arquivos da página inicial
COPY index.html /usr/share/nginx/html/
COPY index.js /usr/share/nginx/html/
COPY index.css /usr/share/nginx/html/
COPY global.css /usr/share/nginx/html/
COPY validations.js /usr/share/nginx/html/

# Copia todas as páginas da pasta pages
COPY pages/ /usr/share/nginx/html/pages/

# Porta utilizada pelo Nginx
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]