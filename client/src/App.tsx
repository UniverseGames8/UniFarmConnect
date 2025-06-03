import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/modules/auth/context/AuthContext';
import { WebSocketProvider } from '@/shared/context/WebSocketContext';
import { NotificationProvider } from '@/shared/context/NotificationContext';
import { TelegramCheck } from '@/modules/auth/components/TelegramCheck';
import { TelegramAuth } from '@/modules/auth/components/TelegramAuth';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { Dashboard } from '@/modules/dashboard/pages/Dashboard';
import { Farming } from '@/modules/farming/pages/Farming';
import { Missions } from '@/modules/missions/pages/Missions';
import { Wallet } from '@/modules/wallet/pages/Wallet';
import { Testing } from '@/modules/testing/pages/Testing';

const NotFound = () => <div>404 - Страница не найдена</div>;

const App = () => {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <NotificationProvider>
          <Router>
            <TelegramCheck>
              <Routes>
                {/* Публичные маршруты */}
                <Route path="/auth/*" element={<div>Auth Pages</div>} />

                {/* Защищенные маршруты */}
                <Route element={<MainLayout><Outlet /></MainLayout>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/farming" element={<Farming />} />
                  <Route path="/missions" element={<Missions />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/testing" element={<Testing />} />
                </Route>

                {/* Редирект с корня на дашборд */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TelegramCheck>
          </Router>
        </NotificationProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
};

export default App;