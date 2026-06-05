import { useState } from "react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon, type IconName } from "./Icon";
import { useAuth } from "../lib/auth";

function NavItem({ to, icon, label, end }: { to: string; icon: IconName; label: string; end?: boolean }) {
  const I = Icon[icon];
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
      <I className="nav-icon" />
      {label}
    </NavLink>
  );
}

const LANGS = [
  { id: "pt", flag: "🇧🇷", label: "Português" },
  { id: "en", flag: "🇺🇸", label: "English" },
  { id: "es", flag: "🇪🇸", label: "Español" },
] as const;

function TopBar({ crumbs }: { crumbs: string[] }) {
  const { t, i18n } = useTranslation();
  const { user, updatePrefs } = useAuth();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const theme = user?.theme ?? "light";

  return (
    <div className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <span key={i}>
            {i > 0 && <span className="sep"> / </span>}
            <span className={i === crumbs.length - 1 ? "cur" : ""}>{c}</span>
          </span>
        ))}
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <Icon.Search />
          <input placeholder={`${t("common.search")} ⌘K`} />
        </div>
        <button
          className="icon-btn"
          aria-label="Theme"
          onClick={() => void updatePrefs({ theme: theme === "light" ? "dark" : "light" })}
        >
          {theme === "light" ? <Icon.Moon /> : <Icon.Sun />}
        </button>

        <div style={{ position: "relative" }}>
          <button className="icon-btn" aria-label="Language" onClick={() => setLangOpen((o) => !o)}>
            <Icon.Globe />
          </button>
          {langOpen && (
            <div className="menu-pop" onMouseLeave={() => setLangOpen(false)}>
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  className={`menu-item ${i18n.language === l.id ? "active" : ""}`}
                  onClick={() => {
                    void i18n.changeLanguage(l.id);
                    void updatePrefs({ locale: l.id });
                    setLangOpen(false);
                  }}
                >
                  <span>{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="icon-btn" aria-label="Notifications">
          <Icon.Bell />
        </button>

        <div style={{ position: "relative" }}>
          <button className="btn btn-primary btn-sm" onClick={() => setNewOpen((o) => !o)}>
            <Icon.Plus />
            {t("common.new")}
          </button>
          {newOpen && (
            <div className="menu-pop" onMouseLeave={() => setNewOpen(false)}>
              <button className="menu-item" onClick={() => { setNewOpen(false); navigate("/surveys/new"); }}>
                <Icon.Survey />
                {t("nav.surveyNew")}
              </button>
              <button className="menu-item" onClick={() => { setNewOpen(false); navigate("/usability"); }}>
                <Icon.Figma />
                {t("nav.usabilityNew")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Shell({ crumbs, children }: { crumbs: string[]; children: ReactNode }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">F</div>
          <span className="brand-name">Folio</span>
          <span className="brand-beta">{t("brand.beta")}</span>
        </div>

        <nav className="nav-group">
          <div className="nav-section">{t("nav.main")}</div>
          <NavItem to="/" end icon="Home" label={t("nav.dashboard")} />

          <div className="nav-section">{t("nav.surveys")}</div>
          <NavItem to="/surveys/new" icon="Plus" label={t("nav.surveyNew")} />
          <NavItem to="/surveys" end icon="Survey" label={t("nav.surveyList")} />

          <div className="nav-section">{t("nav.usability")}</div>
          <NavItem to="/usability" icon="Figma" label={t("nav.usabilityList")} />

          <div className="nav-section">{t("nav.others")}</div>
          <NavItem to="/library" icon="Library" label={t("nav.library")} />
          <NavItem to="/participants" icon="People" label={t("nav.people")} />
          <NavItem to="/security" icon="Shield" label={t("nav.security")} />
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-card-main">
              <span className="user-avatar">{user?.avatarInitial ?? "U"}</span>
              <div style={{ minWidth: 0 }}>
                <div className="user-name">{user?.name}</div>
                <div className="user-role">{user?.email}</div>
              </div>
            </div>
            <button className="user-logout" aria-label={t("nav.logout")} onClick={() => void logout()}>
              <Icon.LogOut />
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <TopBar crumbs={crumbs} />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
