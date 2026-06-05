# Single-service production image: builds the SPA + API and serves both
# from the Node server.
FROM node:22-slim AS build
WORKDIR /app

# Prisma needs OpenSSL on debian-slim to load its query engine.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install deps for both packages.
COPY server/package*.json ./server/
COPY web/package*.json ./web/
RUN cd server && npm install && cd ../web && npm install

# Build.
COPY server ./server
COPY web ./web
RUN cd server && npx prisma generate && npm run build
RUN cd web && npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/server ./server
COPY --from=build /app/web/dist ./web/dist
WORKDIR /app/server
EXPOSE 4000
# Sync the schema to the database (creates tables on first boot) then start.
# DATABASE_URL must be provided at runtime (a Postgres connection string).
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
