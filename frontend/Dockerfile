FROM node:20-alpine AS build

WORKDIR /app

# Configure npm for resilient network downloads & retries
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000

COPY package*.json ./

RUN npm install --no-audit --no-fund

COPY . .

# Use the Docker-specific env file so VITE_API_BASE_URL=/api/v1
# This makes the built JS call /api/v1/... which nginx proxies to the backend container.
# Without this, VITE_API_BASE_URL would fall back to localhost and break on any server.
RUN cp .env.docker .env && npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
