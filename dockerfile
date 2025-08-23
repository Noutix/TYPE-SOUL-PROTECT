FROM node:18-alpine

# Crée un dossier de travail
WORKDIR /app

# Copie package.json et package-lock.json
COPY package*.json ./

# Installe seulement les dépendances de prod
RUN npm install --production

# Copie tout ton code
COPY . .

# Lance ton bot depuis src/index.js
CMD ["node", "src/index.js"]
