import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./lib/i18n";
import { bootstrapAppearance } from "./lib/theme";
import { AuthProvider } from "./lib/auth";
import { ToastProvider } from "./components/ui/Toast";
import { App } from "./App";

// Design tokens + ported component CSS (order matters: tokens first).
import "./styles/styles.css";
import "./styles/styles-list.css";
import "./styles/styles-journey.css";
import "./styles/styles-insights.css";
import "./styles/styles-usability.css";
import "./styles/styles-people.css";
import "./styles/styles-auth.css";
import "./styles/app.css";

bootstrapAppearance();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
