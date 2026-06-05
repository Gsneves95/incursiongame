import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import {
  AuthedRequest,
  hashPassword,
  requireAuth,
  signToken,
  tokenExpiry,
  verifyPassword,
} from "../auth.js";

export const authRouter = Router();

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function publicUser(u: {
  id: string;
  name: string;
  email: string;
  avatarInitial: string;
  locale: string;
  theme: string;
  palette: string;
  twoFactorEnabled: boolean;
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatarInitial: u.avatarInitial,
    locale: u.locale,
    theme: u.theme,
    palette: u.palette,
    twoFactorEnabled: u.twoFactorEnabled,
  };
}

function clientMeta(req: AuthedRequest) {
  return {
    device: String(req.headers["user-agent"] ?? "Unknown").slice(0, 180),
    ip: (req.headers["x-forwarded-for"]?.toString().split(",")[0] ?? req.ip ?? "").trim(),
  };
}

async function startSession(userId: string, req: AuthedRequest) {
  const meta = clientMeta(req);
  const session = await prisma.authSession.create({
    data: { userId, token: "", device: meta.device, ip: meta.ip, expiresAt: tokenExpiry() },
  });
  const token = signToken({ sub: userId, sid: session.id });
  await prisma.authSession.update({ where: { id: session.id }, data: { token } });
  return token;
}

authRouter.post("/signup", async (req: AuthedRequest, res) => {
  const parsed = credentials.extend({ name: z.string().min(2) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "email_taken" });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      avatarInitial: name.trim().charAt(0).toUpperCase() || "U",
    },
  });
  const token = await startSession(user.id, req);
  await prisma.accessLog.create({ data: { userId: user.id, event: "login", method: "password", ...clientMeta(req) } });
  res.json({ token, user: publicUser(user) });
});

authRouter.post("/login", async (req: AuthedRequest, res) => {
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && (await verifyPassword(password, user.passwordHash));
  if (!user || !ok) {
    await prisma.accessLog.create({
      data: { userId: user?.id, event: "login_failed", method: "password", status: "fail", ...clientMeta(req) },
    });
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const token = await startSession(user.id, req);
  await prisma.accessLog.create({ data: { userId: user.id, event: "login", method: "password", ...clientMeta(req) } });
  res.json({ token, user: publicUser(user) });
});

authRouter.post("/logout", requireAuth, async (req: AuthedRequest, res) => {
  await prisma.authSession.updateMany({
    where: { userId: req.userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await prisma.accessLog.create({ data: { userId: req.userId, event: "logout", ...clientMeta(req) } });
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: "not_found" });
  res.json({ user: publicUser(user) });
});

authRouter.patch("/me/prefs", requireAuth, async (req: AuthedRequest, res) => {
  const prefs = z
    .object({
      locale: z.enum(["pt", "en", "es"]).optional(),
      theme: z.enum(["light", "dark"]).optional(),
      palette: z.enum(["violet", "cobalt", "emerald", "coral"]).optional(),
    })
    .parse(req.body ?? {});
  const user = await prisma.user.update({ where: { id: req.userId }, data: prefs });
  res.json({ user: publicUser(user) });
});
