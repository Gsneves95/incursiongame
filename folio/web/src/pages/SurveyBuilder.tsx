import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Question, QuestionType, Survey } from "../lib/types";
import { Shell } from "../components/Shell";
import { Button, Card, IconPill } from "../components/ui/primitives";
import { Modal } from "../components/ui/Modal";
import { Icon } from "../components/Icon";
import { useToast } from "../components/ui/Toast";

type Draft = Omit<Question, "id"> & { id: string };

const Q_TYPES: { type: QuestionType; hasOptions: boolean }[] = [
  { type: "single", hasOptions: true },
  { type: "multi", hasOptions: true },
  { type: "nps", hasOptions: false },
  { type: "scale", hasOptions: false },
  { type: "short", hasOptions: false },
  { type: "long", hasOptions: false },
];

function newQuestion(type: QuestionType): Draft {
  const base: Draft = { id: `tmp-${Date.now()}-${Math.random()}`, type, title: "", required: false, config: {} };
  if (type === "single" || type === "multi") base.config = { options: ["", ""] };
  if (type === "scale") base.config = { min: 1, max: 5 };
  if (type === "nps") base.config = { min: 0, max: 10 };
  return base;
}

export function SurveyBuilder() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();

  const [surveyId, setSurveyId] = useState<string | null>(id ?? null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Draft[]>([]);
  const [busy, setBusy] = useState(false);
  const [publishedOpen, setPublishedOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<{ survey: Survey }>(`/surveys/${id}`).then((r) => {
      setTitle(r.survey.title);
      setDescription(r.survey.description);
      setPublicId(r.survey.publicId);
      setQuestions(r.survey.questions.map((q) => ({ ...q })));
    });
  }, [id]);

  function update(i: number, patch: Partial<Draft>) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function move(i: number, dir: -1 | 1) {
    setQuestions((qs) => {
      const next = [...qs];
      const j = i + dir;
      if (j < 0 || j >= next.length) return qs;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function setOption(qi: number, oi: number, val: string) {
    setQuestions((qs) =>
      qs.map((q, idx) => {
        if (idx !== qi) return q;
        const options = [...(q.config.options ?? [])];
        options[oi] = val;
        return { ...q, config: { ...q.config, options } };
      })
    );
  }

  const payload = () => ({
    title: title || "Sem título",
    description,
    questions: questions
      .filter((q) => q.title.trim())
      .map((q) => ({ type: q.type, title: q.title, required: q.required, config: q.config })),
  });

  async function persist(): Promise<string> {
    if (surveyId) {
      await api.put<{ survey: Survey }>(`/surveys/${surveyId}`, payload());
      return surveyId;
    }
    const r = await api.post<{ survey: Survey }>("/surveys", payload());
    setSurveyId(r.survey.id);
    setPublicId(r.survey.publicId);
    return r.survey.id;
  }

  async function saveDraft() {
    setBusy(true);
    try {
      await persist();
      await qc.invalidateQueries({ queryKey: ["surveys"] });
      toast.push(t("builder.saved"));
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    setBusy(true);
    try {
      const sid = await persist();
      await api.patch(`/surveys/${sid}/status`, { status: "live" });
      await qc.invalidateQueries({ queryKey: ["surveys"] });
      setPublishedOpen(true);
    } finally {
      setBusy(false);
    }
  }

  const shareUrl = publicId ? `${window.location.origin}/s/${publicId}` : "";

  return (
    <Shell crumbs={[t("nav.surveys"), surveyId ? title || t("nav.surveyNew") : t("nav.surveyNew")]}>
      <button className="back-link" onClick={() => navigate("/surveys")}>
        <Icon.ArrowLeft /> {t("common.back")}
      </button>

      <div className="builder-wrap">
        <div>
          <Card>
            <input
              className="input"
              style={{ fontSize: 20, fontWeight: 700, border: 0, padding: "4px 0", marginBottom: 6 }}
              placeholder={t("builder.titlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="input"
              style={{ border: 0, padding: "4px 0", color: "var(--ink-2)" }}
              placeholder={t("builder.descPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Card>

          <div style={{ marginTop: 16 }}>
            {questions.length === 0 && (
              <Card>
                <p className="caption" style={{ textAlign: "center", padding: "20px 0" }}>{t("builder.emptyState")}</p>
              </Card>
            )}
            {questions.map((q, i) => {
              const meta = Q_TYPES.find((x) => x.type === q.type)!;
              return (
                <Card key={q.id} className="q-card">
                  <div className="q-head">
                    <Icon.Drag style={{ color: "var(--ink-4)", cursor: "grab" }} />
                    <span className="tag tag-primary">{t(`builder.qtype.${q.type}`)}</span>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                      <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => move(i, -1)} aria-label="up"><Icon.ChevronDown style={{ transform: "rotate(180deg)" }} /></button>
                      <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => move(i, 1)} aria-label="down"><Icon.ChevronDown /></button>
                      <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== i))} aria-label="delete"><Icon.Trash /></button>
                    </div>
                  </div>
                  <input
                    className="input"
                    placeholder={t("builder.questionPlaceholder")}
                    value={q.title}
                    onChange={(e) => update(i, { title: e.target.value })}
                  />
                  {meta.hasOptions && (
                    <div style={{ marginTop: 12 }}>
                      {(q.config.options ?? []).map((opt, oi) => (
                        <div className="q-opt-row" key={oi}>
                          <span style={{ color: "var(--ink-4)" }}>○</span>
                          <input
                            className="input"
                            placeholder={t("builder.optionPlaceholder", { n: oi + 1 })}
                            value={opt}
                            onChange={(e) => setOption(i, oi, e.target.value)}
                          />
                          <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => update(i, { config: { ...q.config, options: (q.config.options ?? []).filter((_, x) => x !== oi) } })}><Icon.X /></button>
                        </div>
                      ))}
                      <Button size="sm" variant="ghost" icon="Plus" onClick={() => update(i, { config: { ...q.config, options: [...(q.config.options ?? []), ""] } })}>
                        {t("builder.addOption")}
                      </Button>
                    </div>
                  )}
                  <label className="caption" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer" }}>
                    <input type="checkbox" checked={q.required} onChange={(e) => update(i, { required: e.target.checked })} />
                    {t("common.required")}
                  </label>
                </Card>
              );
            })}
          </div>
        </div>

        <Card>
          <div className="label" style={{ marginBottom: 10 }}>{t("builder.addQuestion")}</div>
          <div className="flex-col gap-2">
            {Q_TYPES.map((qt) => (
              <button key={qt.type} className="menu-item" style={{ border: "1px solid var(--line)" }} onClick={() => setQuestions((qs) => [...qs, newQuestion(qt.type)])}>
                <Icon.Plus />
                {t(`builder.qtype.${qt.type}`)}
              </button>
            ))}
          </div>
          <div className="divider" style={{ margin: "16px 0" }} />
          <div className="flex-col gap-2">
            <Button variant="secondary" onClick={saveDraft} disabled={busy} style={{ justifyContent: "center" }}>
              {t("builder.saveDraft")}
            </Button>
            <Button variant="primary" onClick={publish} disabled={busy} style={{ justifyContent: "center" }}>
              {busy ? t("builder.publishing") : t("builder.publish")}
            </Button>
          </div>
        </Card>
      </div>

      <Modal open={publishedOpen} onClose={() => { setPublishedOpen(false); navigate("/surveys"); }} title={t("builder.published")} size="md"
        footer={<Button variant="primary" onClick={() => { setPublishedOpen(false); navigate("/surveys"); }}>OK</Button>}>
        <div className="flex-col gap-3">
          <IconPill icon="Check" color="mint" lg />
          <label className="field-label">{t("builder.shareLink")}</label>
          <div className="flex gap-2">
            <input className="input" readOnly value={shareUrl} />
            <Button icon="Copy" onClick={() => { void navigator.clipboard.writeText(shareUrl); toast.push(t("common.copied")); }}>
              {t("common.copy")}
            </Button>
          </div>
          <a className="caption text-primary" href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a>
        </div>
      </Modal>
    </Shell>
  );
}
