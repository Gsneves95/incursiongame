import type { SurveyStatus } from "./types";

export function statusTone(status: SurveyStatus): "good" | "warn" | "bad" | "info" | "default" {
  switch (status) {
    case "live": return "good";
    case "paused": return "warn";
    case "completed": return "info";
    case "scheduled": return "info";
    default: return "default";
  }
}

export function relativeTime(iso: string, locale = "pt"): string {
  const diff = Date.now() - new Date(iso).getTime();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 60) return rtf.format(-mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(-days, "day");
  const months = Math.round(days / 30);
  return rtf.format(-months, "month");
}
