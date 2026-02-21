
export interface MatchAnalysisResult {
  matchInfo: string;
  isDeep?: boolean;
  liveStatus?: {
    score: string;
    minute: string;
    isLive: boolean;
  };
  predictions: GoalPrediction[];
  conservativeOption?: {
    market: string;
    odd: number;
    probability: number;
  };
  rationale: string;
  marketConfidence: number;
  sources: GroundingSource[];
  firstHalf: TimeFrameAnalysis;
  secondHalf: TimeFrameAnalysis;
  fullMatch: TimeFrameAnalysis;
  lastUpdated: string;
  technicalAudit: {
    statistics: string;
    context: string;
    tactics: string;
    players: string;
    advancedData: string;
    marketAnalysis: string;
  };
}

export interface TimeFrameAnalysis {
  expectedGoals: string;
  insight: string;
}

export interface GoalPrediction {
  market: string;
  probability: number;      // Probabilidad Estimada Real (0.0 a 1.0)
  impliedProbability: number; // Probabilidad Implícita de la Cuota (1/Cuota)
  expectedValue: number;    // Valor Esperado (EV%)
  isValue: boolean;
  estimatedOdd: number;     // Cuota Justa (Fair Odd)
  currentOdd: number;       // Cuota Betplay
  justification: string;    // Justificación estadística específica
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SavedPick extends GoalPrediction {
  id: string;
  matchInfo: string;
  timestamp: string;
  isLive: boolean;
  scoreAtSave?: string;
}

export enum AppTab {
  ANALYSIS = 'analysis',
  VEO = 'veo',
  HISTORY = 'history'
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
