import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/apiService';
import { ApiResponse } from '@/types/api';

interface BoostSlot {
  id: number;
  name: string;
  isActive: boolean;
  type: 'UNI' | 'TON';
  boostId?: number;
}

export const useBoostSlots = () => {
  return useQuery({
    queryKey: ['boostSlots'],
    queryFn: async (): Promise<BoostSlot[]> => {
      const response = await apiGet<ApiResponse<BoostSlot[]>>('/api/v2/boosts/slots');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch boost slots');
      }
      return response.data;
    },
  });
}; 