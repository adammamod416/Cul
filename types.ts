export enum CalculatorMode {
  STANDARD = 'STANDARD',
  SCIENTIFIC = 'SCIENTIFIC',
  AI_SOLVER = 'AI_SOLVER',
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  type: 'standard' | 'ai';
  timestamp: number;
}

export interface GeminiResponse {
  answer: string;
  explanation: string;
}
