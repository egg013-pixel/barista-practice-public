export type PracticeMode = 'script' | 'simulator';
export type Level = 'excellent' | 'good' | 'retry';
export interface KeywordGroup { label: string; anyOf: string[]; required: boolean }
export interface BaristaStep {
  id: number; part: 1 | 2; title: string; instruction: string; action: string;
  referenceText: string; requiredGroups: KeywordGroup[]; optionalKeywords: string[];
  hint: string[]; evaluationNote: string; source: string; timestamp?: string;
}
export interface Student { name: string; number: string }
export interface Evaluation {
  result: Level; matchedKeywords: string[]; missingKeywords: string[]; feedback: string;
  source: 'local' | 'ai';
}
export interface PracticeRecord {
  mode?: PracticeMode;
  recordId: string; timestamp: string; studentName: string; studentNumber: string;
  sessionId: string; part: string; step: number; stepTitle: string; attempt: number;
  recognizedText: string; evaluation: Level; matchedKeywords: string[];
  missingKeywords: string[]; feedback: string; hintUsed: boolean; scriptViewed: boolean;
  durationSeconds: number; source: 'voice' | 'text'; evaluationSource: 'local' | 'ai';
  syncStatus: 'pending' | 'synced';
}
export interface PracticeSession {
  mode?: PracticeMode; simulatorActions?: string[];
  id: string; student: Student; startedAt: string; completedAt?: string;
  stepIndex: number; completedSteps: number[]; hintSteps: number[]; scriptSteps: number[];
}
