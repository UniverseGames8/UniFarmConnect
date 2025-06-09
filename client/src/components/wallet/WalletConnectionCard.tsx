import React, { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useNotification } from '@/contexts/notificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, LogOut } from 'lucide-react';

/**
 * Компонент карточки подключения кошелька
 * Отображает текущий статус подключения и адрес кошелька TON
 * Использует userContext для получения и управления состоянием кошелька
 */
const WalletConnectionCard: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const { showNotification } = useNotification();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      showNotification({
        type: 'info',
        message: 'Отключение кошелька...'
      });
      
      await tonConnectUI.disconnect();
      
      showNotification({
        type: 'success',
        message: 'TON-кошелек успешно отключен'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Ошибка при отключении кошелька'
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleConnect = async () => {
    try {
      showNotification({
        type: 'info',
        message: 'Ожидание подключения кошелька...'
      });
      
      await tonConnectUI.connectWallet();
      
      showNotification({
        type: 'success',
        message: 'TON-кошелек успешно подключен'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Не удалось подключить кошелек'
      });
    }
  };

  const handleCopyAddress = async () => {
    try {
      const address = tonConnectUI.account?.address;
      if (!address) {
        throw new Error('Адрес кошелька не найден');
      }
      
      await navigator.clipboard.writeText(address);
      
      showNotification({
        type: 'success',
        message: 'TON-адрес скопирован в буфер обмена'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      showNotification({
        type: 'error',
        message: `Не удалось скопировать адрес кошелька: ${errorMessage}`
      });
    }
  };

  const isConnected = tonConnectUI.connected;

  return (
    <Card>
      <CardHeader>
        <CardTitle>TON Кошелек</CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {tonConnectUI.account?.address.slice(0, 6)}...{tonConnectUI.account?.address.slice(-4)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyAddress}
                title="Копировать адрес"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Отключить кошелек
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            className="w-full"
          >
            Подключить TON кошелек
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnectionCard;