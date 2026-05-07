FROM mcr.microsoft.com/playwright:v1.43.0-jammy

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
