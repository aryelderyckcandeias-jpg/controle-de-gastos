# Imagem que já possui o Node.js instalado
FROM node:24-alpine

# Cria e acessa a pasta /app dentro do container
WORKDIR /app

# Copia o package.json
COPY package*.json ./

# Instala o Express
RUN npm install --omit=dev

# Copia o código do backend
COPY server.js ./

# Documenta que o backend utiliza a porta 3000
EXPOSE 3000

# Inicia o backend
CMD ["npm", "start"]