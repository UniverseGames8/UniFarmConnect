import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/apiService';
import { BOOST_PACKAGES } from '@/lib/constants';

interface BoostPackage {
  id: number;
  name: string;
  type: string;
  uniYield: string;
  tonYield: string;
  bonus: string;
  price: string;
}

interface FarmingYield {
  currentYield: number;
  uniYield: number;
  tonYield: number;
}

const BoostOptions: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [animateYield, setAnimateYield] = useState<boolean>(false);
  
  // Получаем данные о boost-пакетах
  const { data: boostPackages } = useQuery<BoostPackage[]>({
    queryKey: ['boostPackages'],
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: BoostPackage[] }>('/api/v2/boost/packages');
      if (!response.success) {
        throw new Error('Failed to fetch boost packages');
      }
      return response.data;
    }
  });
  
  // Получаем данные о текущем доходе
  const { data: farmingYield } = useQuery<FarmingYield>({
    queryKey: ['farmingYield'],
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: FarmingYield }>('/api/v2/farming/yield');
      if (!response.success) {
        throw new Error('Failed to fetch farming yield');
      }
      return response.data;
    },
    refetchInterval: 2000, // Обновляем каждые 2 секунды
  });
  
  // Эффект анимации при обновлении дохода
  useEffect(() => {
    if (document.visibilityState === 'visible' && farmingYield) {
      setAnimateYield(true);
      const timer = setTimeout(() => setAnimateYield(false), 500);
      return () => clearTimeout(timer);
    }
  }, [farmingYield]);
  
  return (
    <div className="mb-6">
      {/* Основной UNI пакет (бесплатный) */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <i className="fas fa-seedling text-green-400 mr-2"></i>
            Основной UNI пакет
          </h2>
        </div>
        
        <div 
          className={`
            bg-card rounded-xl p-4 mb-3
            transition-all duration-500 relative overflow-hidden
            border border-purple-300/10
            shadow-md hover:shadow-lg hover:shadow-primary/10
          `}
          style={{
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            background: 'linear-gradient(135deg, rgba(25, 25, 30, 1) 0%, rgba(30, 25, 35, 1) 100%)'
          }}
        >
          {/* Фоновый эффект свечения */}
          <div 
            className="absolute inset-0 opacity-50 z-0 rounded-xl"
            style={{
              background: 'radial-gradient(ellipse at 30% 20%, rgba(162, 89, 255, 0.07) 0%, transparent 70%), radial-gradient(ellipse at 70% 80%, rgba(72, 205, 115, 0.07) 0%, transparent 70%)',
              opacity: '0.6',
              transition: 'opacity 0.5s ease'
            }}
          ></div>
          
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div>
              {/* UNI Yield */}
              <div className="mb-2">
                <div className="text-xs font-bold text-primary mb-1">UNI Yield:</div>
                <div className="font-bold text-green-400 flex items-center text-lg">
                  <i className="fas fa-chart-line mr-1 text-sm"></i>
                  {farmingYield?.uniYield.toFixed(2) || 0}% Daily
                </div>
              </div>
              
              {/* Счетчик текущего дохода */}
              <div className="mt-2 mb-2 flex items-center">
                <div 
                  className={`
                    text-green-400 font-medium flex items-center
                    transition-all duration-300
                    ${animateYield ? 'scale-110' : 'scale-100'}
                  `}
                >
                  <i className="fas fa-plus text-[10px] mr-1"></i>
                  <span className="mr-1">{farmingYield?.currentYield.toFixed(5) || 0}</span>
                  <span className="text-xs">UNI</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 italic mt-1">
                Доход начисляется каждую секунду
              </p>
            </div>
            
            <div className="flex items-center justify-end">
              <button 
                className={`
                  relative z-10 transition-all duration-300
                  overflow-hidden px-6 py-2.5 rounded-lg font-medium
                  flex items-center justify-center
                  bg-transparent border border-primary text-primary hover:bg-primary/10
                  shadow-md shadow-primary/10
                `}
              >
                {/* Эффект свечения кнопки */}
                <div 
                  className="absolute inset-0 w-full h-full overflow-hidden" 
                  style={{
                    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
                    transform: 'translateX(-100%)',
                    animation: 'shimmer 3s infinite'
                  }}
                ></div>
                
                <span className="relative z-10">Фармить</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Заголовок Boost-пакетов */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <i className="fas fa-rocket text-primary mr-2"></i>
          Airdrop Boost Пакеты
        </h2>
        
        {/* Иконка вопроса с всплывающей подсказкой */}
        <div className="relative">
          <div 
            className="w-5 h-5 rounded-full bg-muted flex items-center justify-center cursor-pointer text-xs"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <i className="fas fa-question"></i>
          </div>
          
          {showTooltip && (
            <div className="absolute right-0 top-6 w-64 bg-card p-3 rounded-md shadow-lg text-xs z-20">
              <p className="mb-2">
                <span className="font-medium">Что такое Boost?</span>
              </p>
              <p className="mb-1">Boost - это ускоритель фарминга UNI и TON токенов для участия в Airdrop.</p>
              <p className="mb-1">
                <span className="inline-flex items-center font-medium">
                  <i className="fas fa-bolt text-primary mr-1"></i> Доходность
                </span> 
                - это ежедневный процент от начисления токенов UNI и TON.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {(boostPackages || BOOST_PACKAGES).map((pack) => (
        <div 
          key={pack.id}
          className={`
            bg-card rounded-xl p-4 mb-3
            transition-all duration-500 relative overflow-hidden
            border border-purple-900/30
            shadow-md hover:shadow-lg hover:shadow-primary/10
          `}
          style={{
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            background: 'linear-gradient(135deg, rgba(20, 20, 25, 1) 0%, rgba(25, 20, 30, 1) 100%)'
          }}
        >
          {/* Фоновый эффект свечения по краям */}
          <div 
            className="absolute inset-0 opacity-50 z-0 rounded-xl"
            style={{
              background: 'radial-gradient(ellipse at 30% 20%, rgba(162, 89, 255, 0.1) 0%, transparent 70%), radial-gradient(ellipse at 70% 80%, rgba(162, 89, 255, 0.05) 0%, transparent 70%)',
              opacity: '0.4',
              transition: 'opacity 0.5s ease'
            }}
          ></div>
          
          {/* Верхняя часть карточки */}
          <div className="mb-4 relative z-10">
            <h3 className="text-md font-medium flex items-center text-purple-300">
              <i className="fas fa-bolt text-primary mr-2"></i>
              {pack.type === "TON" ? "TON Boost" : pack.name}
            </h3>
          </div>
          
          {/* Основная информация о пакете */}
          <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
            <div className="flex flex-col justify-between">
              {/* UNI Yield */}
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">UNI Yield:</div>
                <div className="font-medium text-green-400 flex items-center">
                  <i className="fas fa-chart-line mr-1 text-xs"></i>
                  {pack.uniYield}
                </div>
              </div>
              
              {/* TON Yield */}
              <div>
                <div className="text-xs text-gray-400 mb-1">TON Yield:</div>
                <div className="font-medium text-cyan-400 flex items-center">
                  <i className="fas fa-chart-line mr-1 text-xs"></i>
                  {pack.tonYield}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-between">
              {/* Bonus */}
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">Bonus:</div>
                <div className="font-medium text-green-400 flex items-center">
                  <i className="fas fa-gift mr-1 text-amber-400 text-xs"></i>
                  {pack.bonus}
                </div>
              </div>
              
              {/* Price */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Стоимость:</div>
                <div className="font-medium text-cyan-400">
                  {pack.price}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BoostOptions;
