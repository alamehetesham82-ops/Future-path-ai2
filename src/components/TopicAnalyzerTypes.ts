export interface TopicData {
  easyExplanation: string;
  detailedExplanation: string;
  keyConcepts: string[];
  importantPoints: string[];
  studyNotes: string;
  revisionNotes: string;
  faq: { q: string; a: string }[];
  resources: { title: string; url: string; source: string }[];

  // New Upgraded sections
  difficulty?: "basic" | "medium" | "advanced";
  overview?: string;
  coreConcepts?: { title: string; desc: string }[];
  importantTerms?: { term: string; definition: string }[];
  examples?: string[];
  formulas?: { name: string; eq: string; desc: string }[];
  practicalApps?: string[];
  commonMistakes?: string[];
  summary?: string;
  diagram?: string;
  comparisonChart?: { itemA: string; itemB: string; criteria: string; diff: string }[];
  formulaCards?: { title: string; value: string; note: string }[];
}
