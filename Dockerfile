FROM node:lts-alpine AS builder

WORKDIR /app

# Install dependencies and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

FROM node:lts-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Expose port and start
EXPOSE 3000
CMD ["npm", "start"]
