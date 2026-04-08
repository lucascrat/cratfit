FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY src/ ./src/

# Non-root user for security
RUN addgroup -S fitcrat && adduser -S fitcrat -G fitcrat
USER fitcrat

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "src/index.js"]
