import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "../Icon";

export type AccentColor = "violet" | "mint" | "sky" | "coral" | "peach" | "amber" | "rose" | "teal";

/* ── Button ─────────────────────────────────────────────────────────── */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
  icon?: IconName;
}
export function Button({ variant = "secondary", size = "md", icon, children, className = "", ...rest }: ButtonProps) {
  const I = icon ? Icon[icon] : null;
  const cls = ["btn", `btn-${variant}`, size === "sm" ? "btn-sm" : "", className].filter(Boolean).join(" ");
  return (
    <button className={cls} {...rest}>
      {I && <I />}
      {children}
    </button>
  );
}

/* ── Tag / Badge ────────────────────────────────────────────────────── */
export function Tag({
  children,
  tone = "default",
  dot = false,
}: {
  children: ReactNode;
  tone?: "default" | "good" | "warn" | "bad" | "info" | "primary" | "active";
  dot?: boolean;
}) {
  const toneCls = tone === "default" ? "" : `tag-${tone}`;
  return <span className={`tag ${toneCls} ${dot ? "tag-dot" : ""}`.trim()}>{children}</span>;
}

/* ── IconPill ───────────────────────────────────────────────────────── */
export function IconPill({ icon, color = "violet", lg = false }: { icon: IconName; color?: AccentColor; lg?: boolean }) {
  const I = Icon[icon];
  return (
    <span className={`icon-pill ${color} ${lg ? "lg" : ""}`.trim()}>
      <I />
    </span>
  );
}

/* ── Card ───────────────────────────────────────────────────────────── */
export function Card({ children, pad = true, className = "" }: { children: ReactNode; pad?: boolean; className?: string }) {
  return <div className={`card ${pad ? "card-pad" : ""} ${className}`.trim()}>{children}</div>;
}

/* ── StatCard ───────────────────────────────────────────────────────── */
export function StatCard({
  label,
  value,
  icon,
  color = "violet",
  delta,
}: {
  label: string;
  value: string | number;
  icon: IconName;
  color?: AccentColor;
  delta?: { dir: "pos" | "neg"; text: string };
}) {
  const I = Icon[icon];
  return (
    <div className="stat-card">
      <div className="stat-head">
        <span className="stat-label">{label}</span>
        <span className={`icon-pill ${color}`}>
          <I />
        </span>
      </div>
      <div className="stat-num tnum">{value}</div>
      {delta && (
        <div className="stat-foot">
          <span className={`stat-delta ${delta.dir}`}>{delta.text}</span>
        </div>
      )}
    </div>
  );
}

/* ── Sparkline ──────────────────────────────────────────────────────── */
export function Sparkline({ data, color = "var(--primary)" }: { data: number[]; color?: string }) {
  if (data.length < 2) data = [...data, ...data, 1];
  const w = 120;
  const h = 36;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data
    .map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d - min) / range) * (h - 6) - 3}`)
    .join(" ");
  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Avatar ─────────────────────────────────────────────────────────── */
const GRADIENTS = [
  "linear-gradient(135deg,#F47362,#FB923C)",
  "linear-gradient(135deg,#6457F6,#8A7DFF)",
  "linear-gradient(135deg,#3B82F6,#14B8A6)",
  "linear-gradient(135deg,#EC4899,#FB923C)",
  "linear-gradient(135deg,#10B981,#3B82F6)",
];
export function Avatar({ name, size = 30 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const g = GRADIENTS[name.charCodeAt(0) % GRADIENTS.length];
  return (
    <span
      className="user-avatar"
      style={{ width: size, height: size, background: g, fontSize: size * 0.42, flexShrink: 0 }}
    >
      {initials}
    </span>
  );
}

/* ── EmptyState ─────────────────────────────────────────────────────── */
export function EmptyState({ icon, title, desc, action }: { icon: IconName; title: string; desc?: string; action?: ReactNode }) {
  const I = Icon[icon];
  return (
    <div style={{ textAlign: "center", padding: "56px 24px", color: "var(--ink-3)" }}>
      <span className="icon-pill violet lg" style={{ margin: "0 auto 14px" }}>
        <I />
      </span>
      <div className="h3" style={{ color: "var(--ink)", marginBottom: 6 }}>{title}</div>
      {desc && <div className="caption" style={{ maxWidth: 360, margin: "0 auto 16px" }}>{desc}</div>}
      {action}
    </div>
  );
}

/* ── Spinner ────────────────────────────────────────────────────────── */
export function Spinner({ label }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 48, color: "var(--ink-3)" }}>
      <span className="folio-spinner" />
      {label}
    </div>
  );
}

/* ── Tabs ───────────────────────────────────────────────────────────── */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t.id} className={`tab ${active === t.id ? "active" : ""}`} onClick={() => onChange(t.id)}>
          {t.label}
          {t.count != null && <span className="tnum" style={{ marginLeft: 6, opacity: 0.7 }}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ── SegmentedControl ───────────────────────────────────────────────── */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="tab-pill-group">
      {options.map((o) => (
        <button key={o.id} className={`tab-pill ${value === o.id ? "active" : ""}`} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
