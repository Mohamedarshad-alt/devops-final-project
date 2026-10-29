
FROM node:22-alpine

WORKDIR /app

# Install production dependencies, then remove package managers
# that the application does not need at runtime.
COPY app/package*.json ./

RUN npm ci --omit=dev \
    && npm cache clean --force \
    && rm -rf \
       /usr/local/lib/node_modules/npm \
       /usr/local/lib/node_modules/corepack \
       /opt/yarn-v1.22.22

# Copy application source code.
COPY app/ ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run the application as a non-root user.
USER node

CMD ["node", "src/server.js"]
