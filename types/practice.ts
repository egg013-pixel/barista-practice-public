export type PracticeMode = 'script' | 'simulator';
export type Level = 'excellent' | 'good' | 'retry';
export interface KeywordGroup { label: string; anyOf: string[]; required: boolean }
export interface BaristaStep {
  id: number; part: 1 | 2; title: string; instruction: string; action: string;
  referenceText: string; requiredGroups: KeywordGroup[]; optionalKeywords: string[];
  hint: string[]; evaluationNote: string; source: string; timestamp?: string;
}
export interface Evaluation {
  result: Level; matchedKeywords: string[]; missingKeywords: string[]; feedback: string;
  source: 'local' | 'ai';
}
