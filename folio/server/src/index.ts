import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env, isProd } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { surveysRouter } from "./routes/surveys.js";
import { publicRouter } from "./routes/public.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

app.get("/api/health", (_req, res) => res.json({ ok: true, env: env.NODE_ENV }));
app.use("/api/auth", authRouter);
app.use("/api/surveys", surveysRouter);
app.use("/api/public", publicRouter);

// In production the server also serves the built SPA so the whole product
// deploys as a single Node service.
if (isProd) {
  const dist = path.resolve(__dirname, "..", env.WEB_DIST);
  app.use(express.static(dist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.listen(env.PORT, () => {
  console.log(`Folio API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
