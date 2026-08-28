# Cozizina — imagen de la app Next.js
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Dependencias (incluye devDeps: se necesitan para `next build`)
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci

# Prisma Client
RUN npx prisma generate

# Código y build
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
