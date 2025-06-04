export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ReferralsResponse {
  data: {
    user_id: number;
    username: string;
    total_referrals: number;
    referral_counts: Record<string, number>;
    level_income: Record<string, number>;
    referrals: Array<{
      id: number;
      username: string;
      level: number;
      income: number;
    }>;
  };
}

export interface MissionStatsData {
  completed: number;
  total: number;
  userPoints: number;
  totalAvailable: number;
}

export interface UniFarmingInfo {
  dailyIncomeUni: number;
  totalStaked: number;
  lastHarvest: string;
  nextHarvest: string;
}

export interface TonFarmingInfo {
  dailyIncomeTon: number;
  totalStaked: number;
  lastHarvest: string;
  nextHarvest: string;
} 