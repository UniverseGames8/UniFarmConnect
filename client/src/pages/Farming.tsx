import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UniFarmingCardWithErrorBoundary from '@/components/farming/UniFarmingCardWithErrorBoundary';
import BoostPackagesCardWithErrorBoundary from '@/components/farming/BoostPackagesCardWithErrorBoundary';
import TonFarmingStatusCardWithErrorBoundary from '@/components/ton-boost/TonFarmingStatusCardWithErrorBoundary';
import TonBoostPackagesCardWithErrorBoundary from '@/components/ton-boost/TonBoostPackagesCardWithErrorBoundary';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';

interface FarmingProps {
  userData: any; // Replace with proper type
}

export const Farming: React.FC<FarmingProps> = ({ userData }) => {
  const { hideButton } = useTelegramButtons();
  
  // УБРАНА КНОПКА ФАРМИНГА - больше не показываем никаких кнопок внизу
  React.useEffect(() => {
    hideButton();
  }, [hideButton]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Фарминг</h1>
      
      <Tabs defaultValue="uni" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="uni" className="text-lg">UNI Фарминг</TabsTrigger>
          <TabsTrigger value="ton" className="text-lg">TON Фарминг</TabsTrigger>
        </TabsList>

        <TabsContent value="uni">
          {/* Основной UNI пакет */}
          <UniFarmingCardWithErrorBoundary userData={userData} />
          
          {/* Boost-пакеты - с ErrorBoundary */}
          <BoostPackagesCardWithErrorBoundary userData={userData} />
        </TabsContent>

        <TabsContent value="ton">
          {/* Статус TON фарминга - с ErrorBoundary */}
          <TonFarmingStatusCardWithErrorBoundary />
          
          {/* Активные TON Boost-пакеты - с ErrorBoundary */}
          <div className="mt-6">
            <TonBoostPackagesCardWithErrorBoundary />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};