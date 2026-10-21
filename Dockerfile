# Etapa de Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# npm ci instala exatamente as versões do package-lock.json (build reproduzível)
RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build -- --configuration production

# Etapa de execução com NGINX
FROM nginx:1.27-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/chamado-pro-frontend/browser /usr/share/nginx/html
# Avisos de licença das bibliotecas incluídas no bundle (gerado pelo Angular)
COPY --from=build /app/dist/chamado-pro-frontend/3rdpartylicenses.txt /usr/share/nginx/html/3rdpartylicenses.txt

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
