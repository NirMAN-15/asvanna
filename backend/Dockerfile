FROM node:20-alpine

WORKDIR /app

# Configure npm for resilient network downloads & retries
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000

COPY package*.json ./

RUN npm install --omit=dev --no-audit --no-fund

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
