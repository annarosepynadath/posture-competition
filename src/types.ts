export interface PostureMetrics {
  headScore: number;       // 0 - 100
  shoulderScore: number;   // 0 - 100
  spineScore: number;      // 0 - 100
  hipScore: number;        // 0 - 100
  symmetryScore: number;   // 0 - 100
  overallScore: number;    // 0 - 100
  feedback: string[];
  isWellAligned: boolean;
  isPersonDetected: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number | null;
  metricsBreakdown: PostureMetrics | null;
  completed: boolean;
  rank?: number;
}

export type GameStage = 'setup' | 'pre-turn' | 'challenge' | 'turn-result' | 'leaderboard';

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PostureBadge {
  title: string;
  emoji: string;
  color: string;
  minScore: number;
}
