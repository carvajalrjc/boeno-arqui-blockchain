# Frontend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 5173

# Comando para iniciar (con host 0.0.0.0 para acceso externo)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

