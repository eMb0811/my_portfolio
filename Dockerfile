# --- Étape 1 : build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --mode docker

# --- Étape 2 : image finale avec serveur Node.js & API email ---
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY server.js ./
ENV PORT=80
ENV NODE_ENV=production
EXPOSE 80
CMD ["node", "server.js"]
