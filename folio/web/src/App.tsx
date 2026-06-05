import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./lib/auth";
import { Spinner } from "./components/ui/primitives";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { SurveyList } from "./pages/SurveyList";
import { SurveyBuilder } from "./pages/SurveyBuilder";
import { SurveyResults } from "./pages/SurveyResults";
import { PublicSurvey } from "./pages/PublicSurvey";
import { ComingSoon } from "./pages/ComingSoon";
import { useTranslation } from "react-i18next";

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  const { t } = useTranslation();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/s/:publicId" element={<PublicSurvey />} />

        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/surveys" element={<Protected><SurveyList /></Protected>} />
        <Route path="/surveys/new" element={<Protected><SurveyBuilder /></Protected>} />
        <Route path="/surveys/:id/edit" element={<Protected><SurveyBuilder /></Protected>} />
        <Route path="/surveys/:id" element={<Protected><SurveyResults /></Protected>} />

        <Route path="/usability" element={<Protected><ComingSoon crumb={t("nav.usability")} icon="Figma" /></Protected>} />
        <Route path="/library" element={<Protected><ComingSoon crumb={t("nav.library")} icon="Library" /></Protected>} />
        <Route path="/participants" element={<Protected><ComingSoon crumb={t("nav.people")} icon="People" /></Protected>} />
        <Route path="/security" element={<Protected><ComingSoon crumb={t("nav.security")} icon="Shield" /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
