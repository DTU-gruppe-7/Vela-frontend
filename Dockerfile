# -- Stadie 1: Byg React/Vite applikationen --
FROM node:20-alpine AS build
WORKDIR /app

# Kopier package.json og installer dependencies først (igen, for at cache)
COPY package*.json ./
RUN npm install

# Kopier resten og byg
COPY . .
RUN npm run build

# -- Stadie 2: Server filerne med Nginx --
FROM nginx:alpine

# Kopier vores egen Nginx konfiguration ind over standarden
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopier de kompilerede filer fra build-stadiet ('dist' er mappen Vite bygger til)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]