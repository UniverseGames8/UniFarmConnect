export interface UserData {
  id: number;
  username?: string;
  telegram_id?: number;
  balance?: {
    UNI: string;
    TON: string;
  };
  balance_uni?: string;
}

export interface FarmingInfo {
  isActive: boolean;
  depositAmount: string;
  ratePerSecond: string;
  depositCount?: number;
  totalDepositAmount?: string;
  totalRatePerSecond?: string;
  dailyIncomeUni?: string;
  startDate?: string | null;
  uni_farming_start_timestamp?: string | null;
}

export interface Transaction {
  id: number;
  type: 'deposit' | 'withdraw' | 'reward';
  currency: 'UNI' | 'TON';
  amount: string;
  source: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
} 