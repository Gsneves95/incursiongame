export type SurveyStatus = "draft" | "live" | "paused" | "scheduled" | "completed";
export type QuestionType = "single" | "multi" | "scale" | "short" | "long" | "nps";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitial: string;
  locale: "pt" | "en" | "es";
  theme: "light" | "dark";
  palette: "violet" | "cobalt" | "emerald" | "coral";
  twoFactorEnabled: boolean;
}

export interface QuestionConfig {
  options?: string[];
  min?: number;
  max?: number;
  labels?: { min?: string; max?: string };
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  config: QuestionConfig;
}

export interface SurveyListItem {
  id: string;
  publicId: string;
  title: string;
  type: string;
  status: SurveyStatus;
  cap: number;
  responses: number;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface Survey {
  id: string;
  publicId: string;
  title: string;
  description: string;
  status: SurveyStatus;
  cap: number;
  questions: Question[];
}

export interface PublicSurvey {
  id: string;
  publicId: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface SurveyResults {
  survey: { id: string; title: string; status: SurveyStatus; publicId: string };
  totals: { responses: number; nps: number | null; completion: number };
  perQuestion: Array<{
    id: string;
    type: QuestionType;
    title: string;
    config: QuestionConfig;
    count: number;
    values: unknown[];
  }>;
  responses: Array<{
    id: string;
    respondentName: string;
    device: string;
    npsScore: number | null;
    sentiment: "pos" | "neu" | "neg" | null;
    flagged: boolean;
    submittedAt: string;
    answers: Array<{ questionId: string; value: unknown }>;
  }>;
}
