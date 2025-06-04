import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { correctApiRequest } from '@/lib/correctApiRequest';
import { useUser } from '@/contexts/userContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Интерфейсы для данных API
interface UniFarmingInfo {
  isActive: boolean;
  depositAmount?: string;
  ratePerSecond?: string;
  depositCount?: number;
  totalDepositAmount?: string;
  totalRatePerSecond?: string;
  dailyIncomeUni?: string;
  startDate?: string | null;
  uni_farming_start_timestamp?: string | null;
}

interface TonFarmingInfo {
  totalTonRatePerSecond: string;
  totalUniRatePerSecond: string;
  dailyIncomeTon: string;
  dailyIncomeUni: string;
  deposits: Array<{
    id: number;
    user_id: number;
    ton_amount: string | number;
    uni_amount?: string | number;
    start_date: string;
    end_date?: string;
    status: string;
    created_at: string;
  }>;
}

export const IncomeCardNew: React.FC = () => {
  const { userId } = useUser();
  const validUserId = userId || '1';
  
  // Загружаем данные UNI фарминга
  const { data: uniFarmingInfo } = useQuery({
    queryKey: ['uniFarmingInfo'],
    queryFn: async () => {
      const response = await correctApiRequest<{ success: boolean; data: UniFarmingInfo }>(
        `/api/v2/farming/uni/info?user_id=${validUserId}`,
        'GET'
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch UNI farming info');
      }
      return response.data;
    }
  });
  
  // Загружаем данные TON фарминга
  const { data: tonFarmingInfo } = useQuery({
    queryKey: ['tonFarmingInfo'],
    queryFn: async () => {
      const response = await correctApiRequest<{ success: boolean; data: TonFarmingInfo }>(
        `/api/v2/farming/ton/info?user_id=${validUserId}`,
        'GET'
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch TON farming info');
      }
      return response.data;
    }
  });

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Income</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium">UNI Farming</div>
            <div className="text-2xl font-bold">
              {uniFarmingInfo?.data?.dailyIncomeUni || 0} UNI
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">TON Farming</div>
            <div className="text-2xl font-bold">
              {tonFarmingInfo?.data?.dailyIncomeTon || 0} TON
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeCardNew;