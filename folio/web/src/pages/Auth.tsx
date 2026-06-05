import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";
import { Icon } from "../components/Icon";

export function Auth() {
  const { t } = useTranslation();
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@folio.app");
  const [password, setPassword] = useState("folio123");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(name, email, password);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError && err.code === "invalid_credentials") setError(t("auth.invalidCredentials"));
      else if (err instanceof ApiError && err.code === "email_taken") setError(t("auth.emailTaken"));
      else setError(t("auth.invalidCredentials"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-form">
        <div className="login-form-inner">
          <div className="brand" style={{ border: 0, padding: 0, marginBottom: 28 }}>
            <div className="brand-logo">F</div>
            <span className="brand-name">Folio</span>
            <span className="brand-beta">{t("brand.beta")}</span>
          </div>

          <h1 className="h1" style={{ marginBottom: 6 }}>
            {mode === "login" ? t("auth.welcome") : t("auth.createTitle")}
          </h1>
          <p className="caption" style={{ marginBottom: 24 }}>
            {mode === "login" ? t("auth.welcomeSub") : t("auth.createSub")}
          </p>

          <form onSubmit={submit} className="flex-col gap-4">
            {mode === "signup" && (
              <div>
                <label className="field-label">{t("auth.name")}</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
              </div>
            )}
            <div>
              <label className="field-label">{t("auth.email")}</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="field-label">{t("auth.password")}</label>
              <div style={{ position: "relative" }}>
                <input
                  className="input"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  style={{ position: "absolute", right: 8, top: 8, border: 0, background: "none", cursor: "pointer", color: "var(--ink-3)" }}
                  aria-label="Toggle password"
                >
                  <Icon.EyeOff />
                </button>
              </div>
            </div>

            {error && <div className="tag tag-bad" style={{ alignSelf: "flex-start" }}>{error}</div>}

            <button className="btn btn-primary" type="submit" disabled={busy} style={{ justifyContent: "center" }}>
              {busy ? t("common.loading") : mode === "login" ? t("auth.signIn") : t("auth.signup")}
            </button>
          </form>

          <p className="caption" style={{ marginTop: 18 }}>
            {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
            <button
              className="text-primary"
              style={{ border: 0, background: "none", cursor: "pointer", fontWeight: 600 }}
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
            >
              {mode === "login" ? t("auth.createFree") : t("auth.signIn")}
            </button>
          </p>
          <p className="micro" style={{ marginTop: 12 }}>{t("auth.demoHint")}</p>
        </div>
      </div>

      <div className="login-art">
        <div className="brand" style={{ border: 0, padding: 0, color: "#fff" }}>
          <div className="brand-logo" style={{ background: "rgba(255,255,255,0.2)" }}>F</div>
          <span className="brand-name" style={{ color: "#fff" }}>Folio</span>
        </div>
        <div>
          <h2 className="h1" style={{ color: "#fff", maxWidth: 420, marginBottom: 12 }}>{t("auth.artTitle")}</h2>
          <p style={{ color: "rgba(255,255,255,0.85)", maxWidth: 400, marginBottom: 28 }}>{t("auth.artSub")}</p>
          <div className="login-preview">
            <div className="login-preview-inner">
              <div className="preview-card">
                <div className="insight-ai-mark" style={{ marginBottom: 8 }}><Icon.Sparkle /> AI insight</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Usuários querem onboarding mais curto</div>
                <div className="caption">87% das menções · alta confiança</div>
              </div>
              <div className="preview-card" style={{ marginBottom: 0 }}>
                <div className="flex items-center justify-between">
                  <span className="caption">NPS</span>
                  <span className="h3 tnum">+42</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="micro" style={{ color: "rgba(255,255,255,0.7)" }}>© {new Date().getFullYear()} Folio</div>
      </div>
    </div>
  );
}
