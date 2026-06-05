import process from "node:process";

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-insecure-secret-change-me",
  // Where the SPA build lives, served in production. Relative to server cwd.
  WEB_DIST: process.env.WEB_DIST ?? "../web/dist",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};

export const isProd = env.NODE_ENV === "production";
