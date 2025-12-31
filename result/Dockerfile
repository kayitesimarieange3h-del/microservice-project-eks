# Base stage (shared tools seperti curl & tini)
FROM node:18-slim AS base

# Add curl (healthcheck) & tini (proper init process)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl tini && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local/app

# Dev stage (include nodemon buat hot-reload local dev)
FROM base AS dev

# Install nodemon globally (hanya di dev)
RUN npm install -g nodemon

# Copy package files
COPY package*.json ./

# Install all dependencies (termasuk devDependencies)
RUN npm ci && npm cache clean --force

# Copy code
COPY . .

ENV PORT=80
EXPOSE 80

CMD ["nodemon", "server.js"]

# Production stage (lean & secure)
FROM base AS final

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies (hemat space)
RUN npm ci --only=production && npm cache clean --force

# Copy code dari context (bukan dari stage lain, karena gak ada build step)
COPY . .

# Change ownership ke non-root
RUN chown -R appuser:appgroup /usr/local/app

# Switch ke non-root user
USER appuser

ENV PORT=80
EXPOSE 80

# Healthcheck (cek root endpoint app result, sesuaikan kalau ada path khusus)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Use tini sebagai init
ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["node", "server.js"]