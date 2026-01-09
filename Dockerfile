# Etapa 1: Build
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servir con nginx
FROM nginx:stable-alpine

# Copiamos el build generado al directorio por defecto de nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiamos una configuración básica de nginx (opcional pero recomendable)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
