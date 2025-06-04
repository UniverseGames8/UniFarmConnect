import React, { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/contexts/notificationContext';
import { TonConnectUI } from '@tonconnect/ui';
import { sendTonTransaction } from '@/services/tonConnectService';
import { formatNumberWithPrecision } from '@/utils/formatters';

interface TonBoostPackage {
  id: number;
  name: string;
  priceTon: number;
  bonusUni: number;
  rateTon: number;
  rateUni: number;
}

interface BoostPackagesCardProps {
  tonConnectUI: TonConnectUI;
}

export const BoostPackagesCard: React.FC<BoostPackagesCardProps> = ({ tonConnectUI }) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TonBoostPackage | null>(null);

  const handlePurchase = async (pkg: TonBoostPackage) => {
    try {
      setIsLoading(true);
      setSelectedPackage(pkg);

      const transactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: 'EQD...', // Replace with actual address
            amount: (pkg.priceTon * 1e9).toString(), // Convert to nanoTON
          },
        ],
      };

      const result = await sendTonTransaction(tonConnectUI, transactionRequest, 'TON Boost Purchase');

      if (result.status === 'success' && result.txHash) {
        showNotification({
          type: 'success',
          message: 'TON Boost успешно активирован',
        });
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Не удалось активировать TON Boost',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    } finally {
      setIsLoading(false);
      setSelectedPackage(null);
    }
  };

  const boostPackages: TonBoostPackage[] = [
    {
      id: 1,
      name: 'Basic Boost',
      priceTon: 10,
      bonusUni: 100,
      rateTon: 0.5,
      rateUni: 1.0,
    },
    {
      id: 2,
      name: 'Premium Boost',
      priceTon: 50,
      bonusUni: 600,
      rateTon: 0.8,
      rateUni: 1.5,
    },
    {
      id: 3,
      name: 'Ultra Boost',
      priceTon: 100,
      bonusUni: 1500,
      rateTon: 1.0,
      rateUni: 2.0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>TON Boost Packages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {boostPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-4 border rounded-lg hover:border-primary transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">{pkg.name}</h3>
              <div className="space-y-2">
                <div>💰 Цена: {formatNumberWithPrecision(pkg.priceTon, 2)} TON</div>
                <div>🎁 Бонус: {formatNumberWithPrecision(pkg.bonusUni, 0)} UNI</div>
                <div>📈 Доходность TON: {formatNumberWithPrecision(pkg.rateTon, 2)}% в день</div>
                <div>📈 Доходность UNI: {formatNumberWithPrecision(pkg.rateUni, 2)}% в день</div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => handlePurchase(pkg)}
                disabled={isLoading && selectedPackage?.id === pkg.id}
              >
                {isLoading && selectedPackage?.id === pkg.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Купить
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};