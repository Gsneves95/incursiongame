import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, ApiError } from "../lib/api";
import type { PublicSurvey as PSurvey } from "../lib/types";
import { Button, Card, IconPill, Spinner } from "../components/ui/primitives";

type AnswerMap = Record<string, unknown>;

export function PublicSurvey() {
  const { t } = useTranslation();
  const { publicId } = useParams();
  const [survey, setSurvey] = useState<PSurvey | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notfound" | "notlive" | "done">("loading");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const startedAt = useMemo(() => Date.now(), []);

  useEffect(() => {
    api
      .get<{ survey: PSurvey }>(`/public/surveys/${publicId}`)
      .then((r) => { setSurvey(r.survey); setState("ready"); })
      .catch((e) => {
        if (e instanceof ApiError && e.code === "not_accepting_responses") setState("notlive");
        else setState("notfound");
      });
  }, [publicId]);

  function set(qid: string, value: unknown) {
    setAnswers((a) => ({ ...a, [qid]: value }));
    setError(null);
  }

  async function submit() {
    if (!survey) return;
    const missing = survey.questions.find((q) => q.required && (answers[q.id] == null || answers[q.id] === ""));
    if (missing) { setError(t("respondent.required")); return; }
    setBusy(true);
    try {
      await api.post(`/public/surveys/${publicId}/responses`, {
        durationSec: Math.round((Date.now() - startedAt) / 1000),
        answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
      });
      setState("done");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") return <div className="respondent-shell"><Spinner /></div>;

  if (state === "notfound" || state === "notlive") {
    return (
      <div className="respondent-shell">
        <div className="respondent-inner" style={{ textAlign: "center", paddingTop: 60 }}>
          <IconPill icon="Alert" color="amber" lg />
          <h2 className="h2" style={{ marginTop: 16 }}>{state === "notlive" ? t("respondent.notLive") : t("respondent.notFound")}</h2>
        </div>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="respondent-shell">
        <div className="respondent-inner" style={{ textAlign: "center", paddingTop: 60 }}>
          <IconPill icon="Check" color="mint" lg />
          <h2 className="h2" style={{ marginTop: 16 }}>{t("respondent.thanks")}</h2>
          <p className="caption">{t("respondent.thanksSub")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="respondent-shell">
      <div className="respondent-inner">
        <div className="brand" style={{ border: 0, padding: 0, marginBottom: 24 }}>
          <div className="brand-logo">F</div>
          <span className="brand-name">Folio</span>
        </div>
        <h1 className="h1" style={{ marginBottom: 6 }}>{survey!.title}</h1>
        {survey!.description && <p className="caption" style={{ marginBottom: 24 }}>{survey!.description}</p>}

        <div className="flex-col gap-4">
          {survey!.questions.map((q, i) => (
            <Card key={q.id}>
              <h3 className="h4" style={{ marginBottom: 14 }}>
                {i + 1}. {q.title} {q.required && <span style={{ color: "var(--coral)" }}>*</span>}
              </h3>

              {(q.type === "single" || q.type === "multi") && (
                <div>
                  {(q.config.options ?? []).map((opt) => {
                    const selected = q.type === "single" ? answers[q.id] === opt : Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt);
                    return (
                      <div
                        key={opt}
                        className={`choice-opt ${selected ? "sel" : ""}`}
                        onClick={() => {
                          if (q.type === "single") set(q.id, opt);
                          else {
                            const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
                            set(q.id, cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]);
                          }
                        }}
                      >
                        <span style={{ width: 16, height: 16, borderRadius: q.type === "single" ? "50%" : 4, border: "2px solid var(--ink-4)", background: selected ? "var(--primary)" : "transparent" }} />
                        {opt}
                      </div>
                    );
                  })}
                </div>
              )}

              {(q.type === "nps" || q.type === "scale") && (
                <div>
                  <div className="nps-scale">
                    {Array.from({ length: (q.config.max ?? 10) - (q.config.min ?? 0) + 1 }, (_, k) => (q.config.min ?? 0) + k).map((n) => (
                      <button key={n} className={`nps-btn ${answers[q.id] === n ? "sel" : ""}`} onClick={() => set(q.id, n)}>{n}</button>
                    ))}
                  </div>
                  <div className="flex justify-between caption" style={{ marginTop: 8 }}>
                    <span>{t("respondent.npsLow")}</span>
                    <span>{t("respondent.npsHigh")}</span>
                  </div>
                </div>
              )}

              {q.type === "short" && (
                <input className="input" value={(answers[q.id] as string) ?? ""} onChange={(e) => set(q.id, e.target.value)} />
              )}
              {q.type === "long" && (
                <textarea className="textarea" value={(answers[q.id] as string) ?? ""} onChange={(e) => set(q.id, e.target.value)} />
              )}
            </Card>
          ))}
        </div>

        {error && <div className="tag tag-bad" style={{ marginTop: 16 }}>{error}</div>}

        <Button variant="primary" onClick={submit} disabled={busy} style={{ marginTop: 20, width: "100%", justifyContent: "center" }}>
          {busy ? t("respondent.submitting") : t("respondent.submit")}
        </Button>
      </div>
    </div>
  );
}
