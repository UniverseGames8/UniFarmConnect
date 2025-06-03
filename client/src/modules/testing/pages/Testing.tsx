import { ApiTester } from '@/shared/components/ApiTester';
import { NavigationTester } from '@/shared/components/NavigationTester';
import { WebSocketTester } from '@/shared/components/WebSocketTester';
import { NotificationTester } from '@/shared/components/NotificationTester';
import { TelegramTester } from '@/shared/components/TelegramTester';

export const Testing = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-8">Testing Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ApiTester />
          <NavigationTester />
        </div>
        <div className="space-y-8">
          <WebSocketTester />
          <NotificationTester />
          <TelegramTester />
        </div>
      </div>
    </div>
  );
}; 