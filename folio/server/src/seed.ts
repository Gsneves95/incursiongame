import { prisma } from "./db.js";
import { hashPassword } from "./auth.js";

// Seeds a demo account + a live sample survey with a few responses so the
// dashboard and results screens have something to show on first run.
async function main() {
  const email = "demo@folio.app";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Seed already applied (demo user exists). Skipping.");
    return;
  }

  const user = await prisma.user.create({
    data: { name: "Ana Demo", email, passwordHash: await hashPassword("folio123"), avatarInitial: "A" },
  });

  const survey = await prisma.survey.create({
    data: {
      ownerId: user.id,
      title: "Pesquisa de satisfação — onboarding",
      description: "Como foi sua primeira semana usando o produto?",
      status: "live",
      cap: 200,
      publishedAt: new Date(),
      questions: {
        create: [
          {
            order: 0,
            type: "nps",
            title: "De 0 a 10, o quanto você recomendaria nosso produto?",
            required: true,
            config: JSON.stringify({ min: 0, max: 10 }),
          },
          {
            order: 1,
            type: "single",
            title: "Qual recurso você mais usou?",
            config: JSON.stringify({ options: ["Pesquisas", "Testes de usabilidade", "Insights", "Biblioteca"] }),
          },
          {
            order: 2,
            type: "long",
            title: "O que poderíamos melhorar?",
            config: JSON.stringify({}),
          },
        ],
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  const [nps, feature, open] = survey.questions;
  const samples = [
    { name: "Bruno", score: 9, feature: "Insights", text: "Os insights por IA economizam muito tempo." },
    { name: "Carla", score: 7, feature: "Pesquisas", text: "Senti falta de mais tipos de gráfico." },
    { name: "Diego", score: 10, feature: "Pesquisas", text: "Construtor muito intuitivo!" },
    { name: "Erika", score: 5, feature: "Testes de usabilidade", text: "A conexão com o Figma poderia ser mais clara." },
  ];

  for (const s of samples) {
    await prisma.surveyResponse.create({
      data: {
        surveyId: survey.id,
        respondentName: s.name,
        device: "Desktop",
        npsScore: s.score,
        sentiment: s.score >= 9 ? "pos" : s.score <= 6 ? "neg" : "neu",
        completionPct: 100,
        answers: {
          create: [
            { questionId: nps.id, value: JSON.stringify(s.score) },
            { questionId: feature.id, value: JSON.stringify(s.feature) },
            { questionId: open.id, value: JSON.stringify(s.text) },
          ],
        },
      },
    });
  }

  console.log("Seed complete. Login: demo@folio.app / folio123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
