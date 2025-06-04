import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useActiveBoosts } from '@/hooks/useActiveBoosts';
import { useBoostSlots } from '@/hooks/useBoostSlots';
import { cn } from '@/lib/utils';

interface Boost {
  id: number;
  type: 'UNI' | 'TON';
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

interface BoostSlot {
  id: number;
  name: string;
  isActive: boolean;
  type: 'UNI' | 'TON';
  boostId?: number;
}

export const BoostStatusCard: React.FC = () => {
  const { data: activeBoosts = [] } = useActiveBoosts();
  const { data: boostSlots = [] } = useBoostSlots();
  
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [glowingSlotsIndices, setGlowingSlotsIndices] = useState<number[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [, navigate] = useLocation();
  
  // Делаем плавное появление блока
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Случайно выбираем слоты для анимации свечения
  useEffect(() => {
    // Сначала всегда добавляем индексы активных бустов
    const activeIndices = Array.from({ length: activeBoosts.length }, (_, i) => i);
    setGlowingSlotsIndices(activeIndices);
    
    // Обновляем анимацию только если компонент видим
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setGlowingSlotsIndices([...activeIndices]);
      }
    }, 6000);
    
    return () => clearInterval(intervalId);
  }, [activeBoosts.length]);
  
  // Обработчик нажатия и навигации
  const handleClick = useCallback((index: number) => {
    setActiveIndex(index);
    
    try {
      // Визуальный эффект перед переходом
      setTimeout(() => {
        setActiveIndex(null);
        navigate('/farming');
      }, 150);
    } catch (error) {
      console.error('Navigation error:', error);
      setActiveIndex(null);
    }
  }, [navigate]);
  
  // Возвращает цвет для конкретного буста на основе его типа
  const getBoostColor = useCallback((index: number) => {
    if (index >= activeBoosts.length) {
      return 'text-foreground'; // неактивный буст
    }
    
    const boostType = activeBoosts[index].type;
    return boostType === 'UNI' ? 'text-[#A259FF]' : 'text-[#6DBFFF]';
  }, [activeBoosts]);
  
  return (
    <Card className={cn(
      "p-4 transition-opacity duration-300",
      visible ? "opacity-100" : "opacity-0"
    )}>
      <CardHeader>
        <CardTitle>Boost Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {boostSlots.map((slot: BoostSlot, index: number) => (
            <div
              key={slot.id}
              className={cn(
                "text-center p-4 rounded-lg transition-all duration-300 cursor-pointer",
                "hover:bg-accent/50",
                activeIndex === index && "scale-95",
                glowingSlotsIndices.includes(index) && "ring-2 ring-primary/50",
                getBoostColor(index)
              )}
              onClick={() => handleClick(index)}
            >
              <div className="text-sm font-medium">{slot.name}</div>
              <div className="text-xs text-muted-foreground">
                {slot.isActive ? 'Active' : 'Inactive'}
              </div>
              {slot.boostId && (
                <div className="text-xs mt-1">
                  {activeBoosts.find((b: Boost) => b.id === slot.boostId)?.type || ''} Boost
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BoostStatusCard;