import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthContext } from '@/modules/auth/context/AuthContext';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL}?userId=${user.id}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WebSocket] Соединение установлено');
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log('[WebSocket] Соединение закрыто');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Ошибка:', error);
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WebSocket] Получено сообщение:', data);
        setLastMessage(data);
      } catch (error) {
        console.error('[WebSocket] Ошибка парсинга сообщения:', error);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [user]);

  const value = {
    isConnected,
    lastMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}; 