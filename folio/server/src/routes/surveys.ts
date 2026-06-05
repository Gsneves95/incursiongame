import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { AuthedRequest, requireAuth } from "../auth.js";

export const surveysRouter = Router();
surveysRouter.use(requireAuth);

const questionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["single", "multi", "scale", "short", "long", "nps"]),
  title: z.string().min(1),
  required: z.boolean().default(false),
  config: z.record(z.any()).default({}),
});

const surveyInput = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  cap: z.number().int().nonnegative().default(0),
  questions: z.array(questionSchema).default([]),
});

function serializeSurvey(s: any) {
  return {
    ...s,
    questions: (s.questions ?? []).map((q: any) => ({
      ...q,
      config: safeParse(q.config),
    })),
  };
}

function safeParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// List all surveys owned by the user, with light aggregates for the list view.
surveysRouter.get("/", async (req: AuthedRequest, res) => {
  const surveys = await prisma.survey.findMany({
    where: { ownerId: req.userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { responses: true, questions: true } } },
  });
  res.json({
    surveys: surveys.map((s) => ({
      id: s.id,
      publicId: s.publicId,
      title: s.title,
      type: s.type,
      status: s.status,
      cap: s.cap,
      responses: s._count.responses,
      questionCount: s._count.questions,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      publishedAt: s.publishedAt,
    })),
  });
});

surveysRouter.get("/:id", async (req: AuthedRequest, res) => {
  const survey = await prisma.survey.findFirst({
    where: { id: req.params.id, ownerId: req.userId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!survey) return res.status(404).json({ error: "not_found" });
  res.json({ survey: serializeSurvey(survey) });
});

surveysRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = surveyInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  const { title, description, cap, questions } = parsed.data;

  const survey = await prisma.survey.create({
    data: {
      ownerId: req.userId!,
      title,
      description,
      cap,
      questions: {
        create: questions.map((q, i) => ({
          type: q.type,
          title: q.title,
          required: q.required,
          order: i,
          config: JSON.stringify(q.config ?? {}),
        })),
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  res.status(201).json({ survey: serializeSurvey(survey) });
});

surveysRouter.put("/:id", async (req: AuthedRequest, res) => {
  const owned = await prisma.survey.findFirst({ where: { id: req.params.id, ownerId: req.userId } });
  if (!owned) return res.status(404).json({ error: "not_found" });

  const parsed = surveyInput.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  const { title, description, cap, questions } = parsed.data;

  // Replace questions wholesale when provided — keeps the builder simple.
  if (questions) {
    await prisma.question.deleteMany({ where: { surveyId: req.params.id } });
  }

  const survey = await prisma.survey.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(cap !== undefined ? { cap } : {}),
      ...(questions
        ? {
            questions: {
              create: questions.map((q, i) => ({
                type: q.type,
                title: q.title,
                required: q.required,
                order: i,
                config: JSON.stringify(q.config ?? {}),
              })),
            },
          }
        : {}),
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  res.json({ survey: serializeSurvey(survey) });
});

const statusSchema = z.object({ status: z.enum(["draft", "live", "paused", "scheduled", "completed"]) });

surveysRouter.patch("/:id/status", async (req: AuthedRequest, res) => {
  const owned = await prisma.survey.findFirst({ where: { id: req.params.id, ownerId: req.userId } });
  if (!owned) return res.status(404).json({ error: "not_found" });
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const goingLive = parsed.data.status === "live" && !owned.publishedAt;
  const survey = await prisma.survey.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status, ...(goingLive ? { publishedAt: new Date() } : {}) },
  });
  res.json({ survey });
});

surveysRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const owned = await prisma.survey.findFirst({ where: { id: req.params.id, ownerId: req.userId } });
  if (!owned) return res.status(404).json({ error: "not_found" });
  await prisma.survey.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// Aggregated results for a survey (overview tab).
surveysRouter.get("/:id/results", async (req: AuthedRequest, res) => {
  const survey = await prisma.survey.findFirst({
    where: { id: req.params.id, ownerId: req.userId },
    include: {
      questions: { orderBy: { order: "asc" } },
      responses: { include: { answers: true }, orderBy: { submittedAt: "desc" } },
    },
  });
  if (!survey) return res.status(404).json({ error: "not_found" });

  const npsScores = survey.responses.map((r) => r.npsScore).filter((n): n is number => n != null);
  const promoters = npsScores.filter((n) => n >= 9).length;
  const detractors = npsScores.filter((n) => n <= 6).length;
  const nps = npsScores.length ? Math.round(((promoters - detractors) / npsScores.length) * 100) : null;

  const perQuestion = survey.questions.map((q) => {
    const cfg = safeParse(q.config);
    const answers = survey.responses.flatMap((r) =>
      r.answers.filter((a) => a.questionId === q.id).map((a) => safeParse(a.value))
    );
    return { id: q.id, type: q.type, title: q.title, config: cfg, count: answers.length, values: answers };
  });

  res.json({
    survey: { id: survey.id, title: survey.title, status: survey.status, publicId: survey.publicId },
    totals: {
      responses: survey.responses.length,
      nps,
      completion: survey.responses.length
        ? Math.round(survey.responses.reduce((s, r) => s + r.completionPct, 0) / survey.responses.length)
        : 0,
    },
    perQuestion,
    responses: survey.responses.map((r) => ({
      id: r.id,
      respondentName: r.respondentName,
      device: r.device,
      npsScore: r.npsScore,
      sentiment: r.sentiment,
      flagged: r.flagged,
      submittedAt: r.submittedAt,
      answers: r.answers.map((a) => ({ questionId: a.questionId, value: safeParse(a.value) })),
    })),
  });
});
