# ==========================================
# 1. Builder Stage
# ==========================================
FROM node:20-slim AS builder

WORKDIR /app

# Install native build tools for better-sqlite3 compilation
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install root dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Install client dependencies
COPY client/package*.json ./client/
RUN cd client && npm install

# Copy source code and build production client bundle
COPY . .
RUN cd client && npm run build

# ==========================================
# 2. Production Runner Stage
# ==========================================
FROM node:20-slim AS runner

WORKDIR /app

# Install runtime tools
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

# Copy built application from builder stage
COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
