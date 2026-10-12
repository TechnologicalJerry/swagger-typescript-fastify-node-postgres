FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies and copy Prisma schema
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Use non-root user
USER node

# Expose port and start
EXPOSE 3000
CMD ["npm", "start"]
