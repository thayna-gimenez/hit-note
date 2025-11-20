# frontend/Dockerfile

# Use uma imagem oficial do Node.js
FROM node:18-alpine

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de dependência e instale
# Copiamos package.json primeiro para aproveitar o cache do Docker
COPY package.json package-lock.json ./
RUN npm install

# Copie o restante do código do frontend
COPY . .

# Expõe a porta padrão do npm run dev (ajuste se for diferente)
EXPOSE 3000

# O comando para iniciar o servidor de desenvolvimento
CMD ["npm", "run", "dev"]