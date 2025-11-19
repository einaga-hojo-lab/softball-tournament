// 試合タイプ
export type GameType = 'league' | 'tournament';

// 試合ステータス
export type GameStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';

// 打席結果
export type AtBatResult = 'hit' | 'homerun' | 'out' | 'strikeout' | 'walk' | 'error' | 'sacrifice';

// 支払いステータス
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'exempted';

// 支払い方法
export type PaymentMethod = 'paypay' | 'bank_transfer' | 'cash' | 'other';

// 大会ステータス
export type TournamentStatus = 'upcoming' | 'registration_open' | 'active' | 'completed' | 'archived';

// 大会情報
export interface Tournament {
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  status: TournamentStatus;
  createdAt: string;
  archived: boolean;
  season: string;
  year: number;
  previousTournamentId?: string;
}

// 大会設定
export interface TournamentConfig {
  tournamentId: string;
  configKey: string;
  configValue: string;
  description: string;
}

// 参加者情報
export interface Participant {
  participantId: string;
  tournamentId: string;
  teamName: string;
  playerName: string;
  email: string;
  phone: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  paymentAmount: number;
  registrationDate: string;
  notes?: string;
}

// チーム
export interface Team {
  teamId: string;
  tournamentId: string;
  teamName: string;
  block: string;
  combinedTeam: boolean;
  seedRank?: number;
  previousRank?: number;
  autoAssigned: boolean;
  captainName: string;
  captainEmail: string;
  memberCount: number;
  notes?: string;
}

// 選手
export interface Player {
  playerId: string;
  tournamentId: string;
  teamId: string;
  playerName: string;
  uniformNumber: number;
  position: string;
  participantId?: string;
}

// 試合
export interface Game {
  gameId: string;
  tournamentId: string;
  gameType: GameType;
  block?: string;
  round?: string;
  teamHomeId: string;
  teamAwayId: string;
  scoreHome: number;
  scoreAway: number;
  status: GameStatus;
  scheduledDate: string;
  scheduledTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  groundNumber: number;
  referee: string;
  recorder: string;
}

// イニング別得点
export interface Inning {
  gameId: string;
  inning: number;
  homeScore: number;
  awayScore: number;
}

// 打席記録
export interface AtBat {
  gameId: string;
  inning: number;
  teamId: string;
  playerId: string;
  battingOrder: number;
  result: AtBatResult;
  bases: number;
  isHomerun: boolean;
  rbi: number;
  notes?: string;
}

// リーグ戦順位表
export interface LeagueStanding {
  tournamentId: string;
  block: string;
  teamId: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  pointsFor: number;
  pointsAgainst: number;
  rank: number;
}

// トーナメント表
export interface TournamentBracket {
  tournamentId: string;
  round: string;
  matchNumber: number;
  team1Id: string;
  team2Id: string;
  winnerId?: string;
  score1?: number;
  score2?: number;
  gameId: string;
}

// 個人成績
export interface PlayerStats {
  tournamentId: string;
  playerId: string;
  playerName: string;
  teamId: string;
  atBats: number;
  hits: number;
  homeruns: number;
  rbis: number;
  strikeouts: number;
  battingAverage: number;
}

// 集金サマリー
export interface PaymentSummary {
  tournamentId: string;
  totalParticipants: number;
  paidCount: number;
  unpaidCount: number;
  totalCollected: number;
  totalExpected: number;
  collectionRate: number;
}
