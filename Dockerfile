# ==========================================================
# FRONTEND
# Controle de Gastos
#
# O container frontend serve somente arquivos estáticos.
#
# O roteamento da aplicação é responsabilidade do
# nginx-proxy definido no docker-compose.
# ==========================================================


FROM nginx:alpine


# ==========================================================
# ARQUIVOS DO FRONTEND
# ==========================================================

COPY pages/ /usr/share/nginx/html/pages/

COPY assets/ /usr/share/nginx/html/assets/


# ==========================================================
# PORTA
# ==========================================================

EXPOSE 80


# ==========================================================
# NGINX
# ==========================================================

CMD ["nginx", "-g", "daemon off;"]