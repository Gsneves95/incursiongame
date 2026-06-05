# Single-service production image: builds the SPA + API and serves both
# from the Node server.
FROM node:22-slim AS build
WORKDIR /app

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
COPY --from=build /app/server ./server
COPY --from=build /app/web/dist ./web/dist
WORKDIR /app/server
EXPOSE 4000
# Apply migrations then boot. DATABASE_URL must be provided at runtime.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
