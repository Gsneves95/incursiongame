import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { SurveyListItem } from "../lib/types";
import { useAuth } from "../lib/auth";
import { Shell } from "../components/Shell";
import { StatCard, IconPill, Tag, SegmentedControl, Spinner } from "../components/ui/primitives";
import { Icon } from "../components/Icon";
import { statusTone } from "../lib/format";

export function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"7" | "30" | "all">("30");

  const { data, isLoading } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => api.get<{ surveys: SurveyListItem[] }>("/surveys"),
  });

  const surveys = data?.surveys ?? [];
  const live = surveys.filter((s) => s.status === "live");
  const totalResponses = surveys.reduce((s, x) => s + x.responses, 0);

  return (
    <Shell crumbs={[t("nav.dashboard")]}>
      <div className="page-hero">
        <div>
          <h1 className="h1">{t("dashboard.hello", { name: user?.name?.split(" ")[0] })}</h1>
          <p className="caption">{t("dashboard.sub")}</p>
        </div>
        <SegmentedControl
          value={period}
          onChange={setPeriod}
          options={[
            { id: "7", label: t("dashboard.period7") },
            { id: "30", label: t("dashboard.period30") },
            { id: "all", label: t("dashboard.periodAll") },
          ]}
        />
      </div>

      <div className="stat-grid">
        <StatCard label={t("dashboard.statActive")} value={live.length} icon="Target" color="violet" delta={{ dir: "pos", text: `${live.length} ${t("status.live").toLowerCase()}` }} />
        <StatCard label={t("dashboard.statResponses")} value={totalResponses} icon="BarChart" color="sky" />
        <StatCard label={t("dashboard.statSessions")} value={0} icon="Record" color="coral" />
        <StatCard label={t("dashboard.statInsights")} value={0} icon="Sparkle" color="amber" />
      </div>

      <div className="dash-grid">
        <div className="card card-pad">
          <button className="section-head" style={{ width: "100%", border: 0, background: "none", cursor: "pointer", padding: 0 }} onClick={() => navigate("/surveys")}>
            <div className="flex items-center gap-2">
              <IconPill icon="Survey" color="sky" />
              <span className="h3">{t("dashboard.surveysCard")}</span>
              <span className="tag">{surveys.length}</span>
            </div>
            <span className="caption flex items-center gap-1">{t("dashboard.seeAll")} <Icon.Chevron /></span>
          </button>
          <div className="divider" style={{ margin: "4px 0 8px" }} />
          {isLoading ? (
            <Spinner />
          ) : surveys.length === 0 ? (
            <p className="caption" style={{ padding: "24px 0", textAlign: "center" }}>{t("dashboard.empty")}</p>
          ) : (
            surveys.slice(0, 5).map((s) => (
              <button key={s.id} className="study-row" onClick={() => navigate(`/surveys/${s.id}`)}>
                <IconPill icon="Survey" color="sky" />
                <div className="study-main">
                  <div className="study-title">{s.title}</div>
                  <div className="study-tags">
                    <Tag tone={statusTone(s.status)} dot>{t(`status.${s.status}`)}</Tag>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="tnum" style={{ fontWeight: 600 }}>{s.responses}</div>
                  <div className="micro">{t("common.responses")}</div>
                </div>
                <Icon.Chevron />
              </button>
            ))
          )}
        </div>

        <div className="card card-pad">
          <div className="section-head">
            <div className="flex items-center gap-2">
              <IconPill icon="Sparkle" color="violet" />
              <span className="h3">{t("dashboard.aiInsights")}</span>
            </div>
          </div>
          <div className="insight" style={{ border: 0, padding: 0 }}>
            <p className="caption">{t("common.soonDesc")}</p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
