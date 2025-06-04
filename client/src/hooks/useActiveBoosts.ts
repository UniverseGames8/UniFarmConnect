import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/apiService';

interface Boost {
  id: number;
  type: 'UNI' | 'TON';
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const useActiveBoosts = () => {
  return useQuery({
    queryKey: ['activeBoosts'],
    queryFn: async (): Promise<Boost[]> => {
      const response = await apiGet<ApiResponse<Boost[]>>('/api/v2/boosts/active');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch active boosts');
      }
      return response.data;
    },
  });
}; 