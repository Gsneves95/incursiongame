import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./db.js";
import { env } from "./env.js";

const TOKEN_TTL_DAYS = 30;

export interface AuthedRequest extends Request {
  userId?: string;
}

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: { sub: string; sid: string }) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: `${TOKEN_TTL_DAYS}d` });
}

export function tokenExpiry() {
  return new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  const cookie = (req as Request & { cookies?: Record<string, string> }).cookies;
  if (cookie?.folio_token) return cookie.folio_token;
  return null;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: "unauthorized" });

    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; sid: string };
    const session = await prisma.authSession.findUnique({ where: { id: decoded.sid } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return res.status(401).json({ error: "session_expired" });
    }
    req.userId = decoded.sub;
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}
