# Imagem Node.js
FROM node:24-alpine

# Diretório da aplicação
WORKDIR /app

# Dependências
COPY package*.json ./

RUN npm install --omit=dev

# Código da aplicação
COPY server.js ./
COPY db.js ./

# Porta do backend
EXPOSE 3000

# Inicialização
CMD ["npm", "start"]