
export type AngleUnit = 'deg' | 'rad';

export interface CalcState {
  display: string;
  formula: string;
  history: HistoryItem[];
  angleUnit: AngleUnit;
  memory: number;
  isSecond: boolean;
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}
