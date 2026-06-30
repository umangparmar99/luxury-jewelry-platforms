# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Runner
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./

EXPOSE 5000
ENV NODE_ENV=production

# Run database migrations (db push) and start server
CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]
