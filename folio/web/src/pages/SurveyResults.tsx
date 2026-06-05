import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { SurveyResults as Results, SurveyStatus } from "../lib/types";
import { Shell } from "../components/Shell";
import { Button, Card, StatCard, Tag, Tabs, Spinner, EmptyState } from "../components/ui/primitives";
import { Icon } from "../components/Icon";
import { statusTone, relativeTime } from "../lib/format";
import { useToast } from "../components/ui/Toast";

type Tab = "overview" | "individual";

function BarBreakdown({ options, values }: { options: string[]; values: unknown[] }) {
  const counts = options.map((opt) => ({
    opt,
    n: values.filter((v) => (Array.isArray(v) ? v.includes(opt) : v === opt)).length,
  }));
  const max = Math.max(...counts.map((c) => c.n), 1);
  return (
    <div>
      {counts.map((c) => (
        <div className="bar-row" key={c.opt}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.opt}</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${(c.n / max) * 100}%` }} /></div>
          <span className="bar-val tnum">{c.n}</span>
        </div>
      ))}
    </div>
  );
}

export function SurveyResults() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("overview");

  const { data, isLoading } = useQuery({
    queryKey: ["results", id],
    queryFn: () => api.get<Results>(`/surveys/${id}/results`),
  });

  if (isLoading || !data) {
    return <Shell crumbs={[t("nav.surveys")]}><Spinner label={t("common.loading")} /></Shell>;
  }

  const { survey, totals, perQuestion, responses } = data;
  const shareUrl = `${window.location.origin}/s/${survey.publicId}`;

  async function setStatus(status: SurveyStatus) {
    await api.patch(`/surveys/${id}/status`, { status });
    await qc.invalidateQueries({ queryKey: ["results", id] });
    await qc.invalidateQueries({ queryKey: ["surveys"] });
  }

  return (
    <Shell crumbs={[t("nav.surveys"), survey.title]}>
      <button className="back-link" onClick={() => navigate("/surveys")}>
        <Icon.ArrowLeft /> {t("common.back")}
      </button>

      <div className="page-hero">
        <div>
          <div className="study-tags" style={{ marginBottom: 8 }}>
            <Tag tone={statusTone(survey.status)} dot>{t(`status.${survey.status}`)}</Tag>
          </div>
          <h1 className="h1">{survey.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button icon="Eye" onClick={() => window.open(shareUrl, "_blank")}>{t("surveys.viewAsRespondent")}</Button>
          <Button icon="Copy" onClick={() => { void navigator.clipboard.writeText(shareUrl); toast.push(t("common.copied")); }}>{t("builder.shareLink")}</Button>
          {survey.status === "live" ? (
            <Button variant="secondary" icon="Pause" onClick={() => void setStatus("paused")}>{t("status.paused")}</Button>
          ) : (
            <Button variant="primary" icon="Play" onClick={() => void setStatus("live")}>{t("status.live")}</Button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <Tabs<Tab>
          active={tab}
          onChange={setTab}
          tabs={[
            { id: "overview", label: t("results.overview") },
            { id: "individual", label: t("results.individual"), count: responses.length },
          ]}
        />
      </div>

      {responses.length === 0 ? (
        <EmptyState icon="BarChart" title={t("results.noResponses")} action={
          <Button variant="primary" icon="Copy" onClick={() => { void navigator.clipboard.writeText(shareUrl); toast.push(t("common.copied")); }}>{t("builder.shareLink")}</Button>
        } />
      ) : tab === "overview" ? (
        <>
          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
            <StatCard label={t("results.totalResponses")} value={totals.responses} icon="BarChart" color="sky" />
            <StatCard label={t("results.nps")} value={totals.nps ?? "—"} icon="Heart" color="coral" />
            <StatCard label={t("results.completion")} value={`${totals.completion}%`} icon="Check" color="mint" />
          </div>

          <div className="flex-col gap-4">
            {perQuestion.map((q) => (
              <Card key={q.id}>
                <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                  <h3 className="h4">{q.title}</h3>
                  <span className="tag">{q.count} {t("common.responses")}</span>
                </div>
                {(q.type === "single" || q.type === "multi") && q.config.options ? (
                  <BarBreakdown options={q.config.options} values={q.values} />
                ) : q.type === "nps" || q.type === "scale" ? (
                  <BarBreakdown options={rangeLabels(q.config.min ?? 0, q.config.max ?? 10)} values={q.values.map(String)} />
                ) : (
                  <div className="flex-col gap-2">
                    {q.values.slice(0, 8).map((v, i) => (
                      <div key={i} className="insight-quote">{String(v)}</div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="survey-list-wrap">
          {responses.map((r) => (
            <div key={r.id} className="survey-row" style={{ cursor: "default" }}>
              <div style={{ flex: 1 }}>
                <div className="study-title">{r.respondentName || "Anônimo"}</div>
                <div className="caption">{r.device} · {relativeTime(r.submittedAt, i18n.language)}</div>
              </div>
              {r.npsScore != null && <div style={{ width: 70 }}><span className={`tag tag-${r.sentiment === "pos" ? "good" : r.sentiment === "neg" ? "bad" : "warn"}`}>NPS {r.npsScore}</span></div>}
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

function rangeLabels(min: number, max: number) {
  return Array.from({ length: max - min + 1 }, (_, i) => String(min + i));
}
