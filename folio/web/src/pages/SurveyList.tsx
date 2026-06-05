import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { SurveyListItem } from "../lib/types";
import { Shell } from "../components/Shell";
import { Button, IconPill, Tag, Sparkline, Spinner, EmptyState } from "../components/ui/primitives";
import { Icon } from "../components/Icon";
import { relativeTime, statusTone } from "../lib/format";

type Tab = "all" | "live" | "paused" | "draft" | "completed";

export function SurveyList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => api.get<{ surveys: SurveyListItem[] }>("/surveys"),
  });
  const surveys = data?.surveys ?? [];
  const live = surveys.filter((s) => s.status === "live").length;

  const counts: Record<Tab, number> = {
    all: surveys.length,
    live,
    paused: surveys.filter((s) => s.status === "paused").length,
    draft: surveys.filter((s) => s.status === "draft").length,
    completed: surveys.filter((s) => s.status === "completed").length,
  };

  const filtered = surveys
    .filter((s) => (tab === "all" ? true : s.status === tab))
    .filter((s) => s.title.toLowerCase().includes(q.toLowerCase()));

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: t("surveys.tabsAll") },
    { id: "live", label: t("surveys.tabsLive") },
    { id: "paused", label: t("surveys.tabsPaused") },
    { id: "draft", label: t("surveys.tabsDraft") },
    { id: "completed", label: t("surveys.tabsCompleted") },
  ];

  return (
    <Shell crumbs={[t("nav.surveys"), t("surveys.title")]}>
      <div className="page-hero">
        <div className="page-hero-id">
          <IconPill icon="Survey" color="sky" lg />
          <div>
            <h1 className="h1">{t("surveys.title")}</h1>
            <p className="caption">{t("surveys.sub", { count: surveys.length, live })}</p>
          </div>
        </div>
        <Button variant="primary" icon="Plus" onClick={() => navigate("/surveys/new")}>
          {t("surveys.newSurvey")}
        </Button>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {tabs.map((tb) => (
          <button key={tb.id} className={`tab ${tab === tb.id ? "active" : ""}`} onClick={() => setTab(tb.id)}>
            {tb.label}
            <span className="tnum" style={{ marginLeft: 6, opacity: 0.6 }}>{counts[tb.id]}</span>
          </button>
        ))}
      </div>

      <div className="topbar-search" style={{ marginBottom: 16, width: 300 }}>
        <Icon.Search />
        <input placeholder={t("common.search")} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {isLoading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="Survey"
          title={t("surveys.empty")}
          action={<Button variant="primary" icon="Plus" onClick={() => navigate("/surveys/new")}>{t("surveys.createFirst")}</Button>}
        />
      ) : (
        <div className="survey-list-wrap">
          <div className="survey-list-head">
            <span style={{ flex: 1 }}>{t("nav.surveyList")}</span>
            <span style={{ width: 130 }}>{t("surveys.colActivity")}</span>
            <span style={{ width: 96 }}>{t("surveys.colResponses")}</span>
            <span style={{ width: 110 }}>{t("surveys.colLast")}</span>
            <span style={{ width: 32 }} />
          </div>
          {filtered.map((s) => {
            const pct = s.cap ? Math.min(100, Math.round((s.responses / s.cap) * 100)) : null;
            return (
              <button key={s.id} className="survey-row" onClick={() => navigate(`/surveys/${s.id}`)}>
                <span className="survey-row-bar" style={{ background: `var(--${statusTone(s.status) === "default" ? "ink-4" : statusTone(s.status) === "good" ? "mint" : statusTone(s.status) === "warn" ? "amber" : "sky"})` }} />
                <div style={{ flex: 1 }}>
                  <div className="study-tags" style={{ marginBottom: 6 }}>
                    <Tag tone={statusTone(s.status)} dot>{t(`status.${s.status}`)}</Tag>
                  </div>
                  <div className="study-title">{s.title}</div>
                </div>
                <div style={{ width: 130 }}>
                  <Sparkline data={[3, 5, 4, 7, 6, 9, s.responses % 10 || 4]} color="var(--sky)" />
                </div>
                <div style={{ width: 96 }}>
                  <div className="tnum" style={{ fontWeight: 600 }}>{s.responses}</div>
                  {pct != null && (
                    <div className="bar-track" style={{ marginTop: 5, width: 70 }}>
                      <div className="bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
                <div style={{ width: 110 }} className="caption">{relativeTime(s.updatedAt, i18n.language)}</div>
                <div className="survey-row-actions">
                  <a
                    className="icon-btn"
                    href={`/s/${s.publicId}`}
                    target="_blank"
                    rel="noreferrer"
                    title={t("surveys.viewAsRespondent")}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: 28, height: 28 }}
                  >
                    <Icon.Eye />
                  </a>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
