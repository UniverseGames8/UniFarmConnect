import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/apiService';

interface FarmingStatus {
  isActive: boolean;
  uniDailyYield: number;
  uniPerSecond: number;
  tonDailyYield: number;
  tonPerSecond: number;
  progressToNextLevel: number;
}

const FarmingStatusCard: React.FC = () => {
  const [isPulsing, setIsPulsing] = useState(false);
  const [isTonPulsing, setIsTonPulsing] = useState(false);
  const [dotOpacity, setDotOpacity] = useState(0.5);
  
  // Получаем данные о статусе фарминга
  const { data: farmingStatus } = useQuery<FarmingStatus>({
    queryKey: ['farmingStatus'],
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: FarmingStatus }>('/api/v2/farming/status');
      if (!response.success) {
        throw new Error('Failed to fetch farming status');
      }
      return response.data;
    },
    refetchInterval: 5000, // Обновляем каждые 5 секунд
  });
  
  // Эффект пульсации для UNI
  useEffect(() => {
    if (document.visibilityState === 'visible') {
      const intervalId = setInterval(() => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 800);
      }, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, []);
  
  // Эффект пульсации для TON
  useEffect(() => {
    if (document.visibilityState === 'visible') {
      const intervalId = setInterval(() => {
        setIsTonPulsing(true);
        setTimeout(() => setIsTonPulsing(false), 800);
      }, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, []);
  
  // Анимация мигающего индикатора
  useEffect(() => {
    if (document.visibilityState === 'visible') {
      const intervalId = setInterval(() => {
        setDotOpacity(prev => prev === 0.5 ? 1 : 0.5);
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, []);
  
  // Стиль для индикатора активности
  const activeIndicatorStyle = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: farmingStatus?.isActive ? '#00FF99' : '#A259FF',
    opacity: dotOpacity,
    transition: 'opacity 0.5s ease',
    marginRight: '8px'
  };
  
  return (
    <div className="bg-card rounded-xl p-4 mb-5 shadow-lg card-hover-effect">
      <div className="flex items-center mb-3">
        <div style={activeIndicatorStyle}></div>
        <p className="text-sm font-medium">
          {farmingStatus?.isActive ? 'Фарминг активен' : 'Фарминг неактивен'}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* UNI Daily Yield */}
        <div className={`transition-all duration-300 ${isPulsing ? 'scale-105' : 'scale-100'}`}>
          <p className="text-sm text-foreground opacity-70">Текущий доход</p>
          <p className="text-lg font-semibold green-gradient-text relative">
            {farmingStatus?.uniDailyYield.toFixed(0) || 0} UNI / сутки
            {isPulsing && (
              <span className="absolute -right-4 top-0">
                <svg className="w-4 h-4 text-accent animate-pulse-fade" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" 
                    strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </span>
            )}
          </p>
          {/* TON Daily Yield */}
          <p className="text-sm text-cyan-400 font-medium mt-1 relative">
            {farmingStatus?.tonDailyYield.toFixed(4) || 0} TON / сутки
            {isTonPulsing && (
              <span className="absolute -right-4 top-0">
                <svg className="w-3 h-3 text-cyan-400 animate-pulse-fade" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" 
                    strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </span>
            )}
          </p>
        </div>
        
        {/* UNI Per Second */}
        <div className={`transition-all duration-300 ${isPulsing ? 'scale-105' : 'scale-100'}`}>
          <p className="text-sm text-foreground opacity-70">Начисление</p>
          <p className="text-md green-gradient-text font-medium relative">
            +{farmingStatus?.uniPerSecond.toFixed(4) || 0} UNI / сек
            <span className="absolute right-0 top-0 transform translate-x-full">
              {isPulsing && (
                <i className="fas fa-arrow-up text-xs text-green-400 animate-bounce"></i>
              )}
            </span>
          </p>
          {/* TON Per Second */}
          <p className="text-sm text-cyan-400 font-medium mt-1 relative">
            +{farmingStatus?.tonPerSecond.toFixed(4) || 0} TON / сек
            <span className="absolute right-0 top-0 transform translate-x-full">
              {isTonPulsing && (
                <i className="fas fa-arrow-up text-xs text-cyan-400 animate-bounce"></i>
              )}
            </span>
          </p>
        </div>
      </div>
      
      {/* Прогресс-бар до следующего повышения */}
      <div className="mt-4">
        <div className="flex justify-between items-center text-xs mb-1">
          <p className="text-foreground opacity-70">Прогресс до +10% дохода</p>
          <p className="text-foreground">{farmingStatus?.progressToNextLevel || 0}%</p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent" 
            style={{ 
              width: `${farmingStatus?.progressToNextLevel || 0}%`, 
              transition: 'width 1s ease-in-out' 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default FarmingStatusCard;
