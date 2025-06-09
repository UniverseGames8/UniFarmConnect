import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/apiService';

interface UserBalance {
  balance_uni: string;
  balance_ton: string;
  uni_farming_balance: string;
  accumulated_ton: string;
}

export function useBalance(userId: string | number) {
  return useQuery({
    queryKey: ['balance', userId],
    queryFn: async (): Promise<UserBalance> => {
      const response = await apiGet<UserBalance>(`/api/wallet/balance?user_id=${userId}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch user balance');
      }
      return response.data;
    },
    enabled: !!userId,
    refetchInterval: 5000, // Обновляем каждые 5 секунд
    staleTime: 1000, // Данные считаются устаревшими через 1 секунду
  });
}

interface UserProfile {
  id: number;
  username: string;
  telegram_id: string;
  created_at: string;
}

export function useUserProfile(userId: string | number) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<UserProfile> => {
      const response = await apiGet<UserProfile>(`/api/me?user_id=${userId}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch user profile');
      }
      return response.data;
    },
    enabled: !!userId,
  });
}