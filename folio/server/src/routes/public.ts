import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";

// Public, unauthenticated endpoints used by the respondent view.
export const publicRouter = Router();

function safeParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Fetch a published survey by its shareable public id.
publicRouter.get("/surveys/:publicId", async (req, res) => {
  const survey = await prisma.survey.findUnique({
    where: { publicId: req.params.publicId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!survey) return res.status(404).json({ error: "not_found" });
  if (survey.status !== "live") return res.status(403).json({ error: "not_accepting_responses", status: survey.status });

  res.json({
    survey: {
      id: survey.id,
      publicId: survey.publicId,
      title: survey.title,
      description: survey.description,
      questions: survey.questions.map((q) => ({
        id: q.id,
        type: q.type,
        title: q.title,
        required: q.required,
        config: safeParse(q.config),
      })),
    },
  });
});

const submission = z.object({
  respondentName: z.string().default(""),
  durationSec: z.number().int().nonnegative().default(0),
  answers: z.array(z.object({ questionId: z.string(), value: z.any() })),
});

publicRouter.post("/surveys/:publicId/responses", async (req, res) => {
  const survey = await prisma.survey.findUnique({
    where: { publicId: req.params.publicId },
    include: { questions: true },
  });
  if (!survey) return res.status(404).json({ error: "not_found" });
  if (survey.status !== "live") return res.status(403).json({ error: "not_accepting_responses" });

  const parsed = submission.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });

  const validIds = new Set(survey.questions.map((q) => q.id));
  const answers = parsed.data.answers.filter((a) => validIds.has(a.questionId));

  // Derive a top-level NPS score if the survey contains an NPS question.
  const npsQuestion = survey.questions.find((q) => q.type === "nps");
  const npsAnswer = npsQuestion ? answers.find((a) => a.questionId === npsQuestion.id) : undefined;
  const npsScore = typeof npsAnswer?.value === "number" ? npsAnswer.value : null;
  const sentiment = npsScore == null ? null : npsScore >= 9 ? "pos" : npsScore <= 6 ? "neg" : "neu";

  const ua = String(req.headers["user-agent"] ?? "");
  const device = /mobile|android|iphone/i.test(ua) ? "Mobile" : "Desktop";
  const completionPct = survey.questions.length
    ? Math.round((answers.length / survey.questions.length) * 100)
    : 100;

  const response = await prisma.surveyResponse.create({
    data: {
      surveyId: survey.id,
      respondentName: parsed.data.respondentName,
      durationSec: parsed.data.durationSec,
      device,
      completionPct,
      npsScore,
      sentiment,
      answers: {
        create: answers.map((a) => ({ questionId: a.questionId, value: JSON.stringify(a.value) })),
      },
    },
  });

  res.status(201).json({ ok: true, responseId: response.id });
});
