# Stage 1 — Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Args needed for Vite build
ARG VITE_API_URL
ARG VITE_R2_PUBLIC_DOMAIN
ARG VITE_GEMINI_API_KEY
ARG VITE_GOOGLE_MAPS_API_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_R2_PUBLIC_DOMAIN=$VITE_R2_PUBLIC_DOMAIN
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

RUN npm run build

# Stage 2 — Serve with Nginx
FROM nginx:stable-alpine

# Copy built SPA
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
