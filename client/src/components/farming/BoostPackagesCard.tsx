import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateQueryWithUserId } from '@/lib/queryClient';
import { correctApiRequest } from '@/lib/correctApiRequest';
import { format } from 'date-fns';
import PaymentMethodDialog from '../ton-boost/PaymentMethodDialog';
import ExternalPaymentStatus from '../ton-boost/ExternalPaymentStatus';
import { useUser } from '@/contexts/userContext';
import { BadgeCheck, Rocket, Sparkles, TrendingUp, Zap } from 'lucide-react';

// Types
interface BoostPackage {
  id: number;
  name: string;
  price: string;
  tonDailyYield: string;
  uniBonus: string;
  color: string;
  icon: JSX.Element;
  popular?: boolean;
}

interface PaymentTransaction {
  transactionId: number;
  paymentLink: string;
  paymentMethod: 'internal_balance' | 'external_wallet';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BoostPackagesCardProps {
  userData?: any;
}

// Constants
const BOOST_PACKAGES: BoostPackage[] = [
  {
    id: 1,
    name: 'Starter Boost',
    price: '1 TON',
    tonDailyYield: '+0.5%/день',
    uniBonus: '+10,000 UNI',
    color: 'from-blue-500 to-indigo-600',
    icon: <Zap size={18} className="text-blue-100" />
  },
  {
    id: 2,
    name: 'Standard Boost',
    price: '5 TON',
    tonDailyYield: '+1%/день',
    uniBonus: '+75,000 UNI',
    color: 'from-purple-500 to-violet-600',
    icon: <TrendingUp size={18} className="text-purple-100" />,
    popular: true
  },
  {
    id: 3,
    name: 'Advanced Boost',
    price: '15 TON',
    tonDailyYield: '+2%/день',
    uniBonus: '+250,000 UNI',
    color: 'from-pink-500 to-rose-600',
    icon: <Sparkles size={18} className="text-pink-100" />
  },
  {
    id: 4,
    name: 'Premium Boost',
    price: '25 TON',
    tonDailyYield: '+2.5%/день',
    uniBonus: '+500,000 UNI',
    color: 'from-amber-500 to-orange-600',
    icon: <Rocket size={18} className="text-amber-100" />
  }
];

const BOOST_PRICES_UNI: Record<number, string> = {
  1: '100000',
  2: '500000',
  3: '1500000',
  4: '2500000'
};

// Helper functions
const getBoostUniPrice = (boostId: number): string => {
  return BOOST_PRICES_UNI[boostId] || '0';
};

const getBoostPackage = (boostId: number): BoostPackage | undefined => {
  return BOOST_PACKAGES.find(bp => bp.id === boostId);
};

const BoostPackagesCard: React.FC<BoostPackagesCardProps> = ({ userData }) => {
  // State
  const [purchasingBoostId, setPurchasingBoostId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [paymentStatusDialogOpen, setPaymentStatusDialogOpen] = useState<boolean>(false);
  const [selectedBoostId, setSelectedBoostId] = useState<number | null>(null);
  const [selectedBoostName, setSelectedBoostName] = useState<string>('');
  const [paymentTransaction, setPaymentTransaction] = useState<PaymentTransaction>({
    transactionId: 0,
    paymentLink: '',
    paymentMethod: 'internal_balance'
  });
  
  const queryClient = useQueryClient();
  const { userId } = useUser();

  // Error handling
  const handleErrorMessage = (message?: string) => {
      if (!message) {
        setErrorMessage('Произошла ошибка при покупке буста');
        return;
      }
      
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('недостаточно') || 
        lowerMessage.includes('баланс') || 
        lowerMessage.includes('balance') || 
        lowerMessage.includes('insufficient')) {
        setErrorMessage('Недостаточно средств на балансе для покупки буста');
        return;
      }
      
      setErrorMessage(message);
  };

  // Mutations
  const buyTonBoostMutation = useMutation({
    mutationFn: async ({ boostId, paymentMethod }: { boostId: number, paymentMethod: 'internal_balance' | 'external_wallet' }) => {
        return await correctApiRequest('/api/v2/ton-farming/purchase', 'POST', {
          user_id: userId,
          boost_id: boostId,
          payment_method: paymentMethod
        });
    },
    onMutate: ({ boostId }) => {
        setPurchasingBoostId(boostId);
        setErrorMessage(null);
        setSuccessMessage(null);
    },
    onSuccess: (data: ApiResponse<any>) => {
        if (data.success) {
          if (data.data.paymentMethod === 'internal_balance') {
            setSuccessMessage(data.message || 'Буст успешно приобретен!');
            invalidateQueryWithUserId(`/api/v2/users`);
            invalidateQueryWithUserId('/api/v2/wallet/balance');
            invalidateQueryWithUserId('/api/v2/transactions');
            invalidateQueryWithUserId('/api/v2/ton-farming/active');
        } else if (data.data.paymentMethod === 'external_wallet') {
            setPaymentTransaction({
              transactionId: data.data.transactionId,
              paymentLink: data.data.paymentLink,
              paymentMethod: 'external_wallet'
            });
            setPaymentStatusDialogOpen(true);
            setPaymentDialogOpen(false);
          }
        } else {
          handleErrorMessage(data.message);
      }
    },
    onError: (error: any) => {
        handleErrorMessage(error.message);
    },
    onSettled: () => {
          setPurchasingBoostId(null);
    }
  });
  
  // Handlers
  const canBuyBoost = (boostId: number): boolean => {
    if (!userData?.balance) return false;
    const boostPackage = getBoostPackage(boostId);
    if (!boostPackage) return false;
    
    const price = parseFloat(boostPackage.price);
    const balance = parseFloat(userData.balance);
    return balance >= price;
  };

  const handleBuyBoost = (boostId: number) => {
    const boostPackage = getBoostPackage(boostId);
    if (!boostPackage) return;

        setSelectedBoostId(boostId);
    setSelectedBoostName(boostPackage.name);
        setPaymentDialogOpen(true);
  };

  const handleSelectPaymentMethod = (boostId: number, paymentMethod: 'internal_balance' | 'external_wallet') => {
        buyTonBoostMutation.mutate({ boostId, paymentMethod });
  };

  const handlePaymentComplete = () => {
          setPaymentStatusDialogOpen(false);
    setPaymentTransaction({
      transactionId: 0,
      paymentLink: '',
      paymentMethod: 'internal_balance'
    });
  };
  
  return (
    <div className="mt-8 px-2">
      <h2 className="text-xl font-semibold mb-6 text-center">
        <span className="inline-flex items-center gap-2">
          <Sparkles size={20} className="text-indigo-400" />
          <span>Airdrop Boost Пакеты</span>
        </span>
      </h2>
      
      {/* Модальное окно выбора способа оплаты с защитой от ошибок */}
      <PaymentMethodDialog
        open={paymentDialogOpen}
        onOpenChange={(open) => {
          try {
            setPaymentDialogOpen(open);
          } catch (error) {
            console.error('[ERROR] BoostPackagesCard - Ошибка при установке состояния paymentDialogOpen:', error);
          }
        }}
        boostId={selectedBoostId || 1}
        boostName={selectedBoostName || "Boost"}
        boostPriceTon={(() => {
          try {
            if (!selectedBoostId) return "1";
            
            const selectedBoost = getBoostPackage(selectedBoostId);
            if (!selectedBoost || !selectedBoost.price) return "1";
            
            const priceParts = selectedBoost.price.split(' ');
            return priceParts[0] || "1";
          } catch (error) {
            console.error('[ERROR] BoostPackagesCard - Ошибка при получении цены буста в TON:', error);
            return "1";
          }
        })()}
        onSelectPaymentMethod={(boostId, paymentMethod) => {
          try {
            handleSelectPaymentMethod(boostId, paymentMethod);
          } catch (error) {
            console.error('[ERROR] BoostPackagesCard - Ошибка при вызове handleSelectPaymentMethod:', error);
            
            // Пытаемся показать сообщение об ошибке
            try {
              setErrorMessage('Не удалось выполнить платеж. Пожалуйста, попробуйте позже.');
              setPaymentDialogOpen(false);
            } catch {}
          }
        }}
      />
      
      {/* Модальное окно статуса внешнего платежа с защитой от ошибок */}
      <ExternalPaymentStatus
        open={paymentStatusDialogOpen}
        onOpenChange={(open) => {
          try {
            setPaymentStatusDialogOpen(open);
          } catch (error) {
            console.error('[ERROR] BoostPackagesCard - Ошибка при установке состояния paymentStatusDialogOpen:', error);
          }
        }}
        userId={userId !== undefined && userId !== null ? userId : 0}
        transactionId={(() => {
          try {
            return paymentTransaction?.transactionId || 0;
          } catch (error) {
            console.error('[ERROR] BoostPackagesCard - Ошибка при получении transactionId:', error);
            return 0;
          }
        })()}
        paymentLink={(() => {
          try {
            return paymentTransaction?.paymentLink || "";
          } catch (error) {
            console.error('[ERROR] BoostPackagesCard - Ошибка при получении paymentLink:', error);
            return "";
          }
        })()}
        boostName={selectedBoostName || "Boost"}
        onPaymentComplete={() => {
          try {
            handlePaymentComplete();
          } catch (error) {
            console.error('[ERROR] BoostPackagesCard - Ошибка при вызове handlePaymentComplete:', error);
            
            // Пытаемся закрыть диалог в любом случае
            try {
              setPaymentStatusDialogOpen(false);
              setSuccessMessage('Платеж обработан. Пожалуйста, проверьте результат.');
            } catch {}
          }
        }}
      />
      
      {/* Сообщение об успехе */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-500 rounded-lg text-green-300 text-center">
          {successMessage}
        </div>
      )}
      
      {/* Сообщение об ошибке */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-300 text-center">
          {errorMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
        {BOOST_PACKAGES.map((boost) => {
          // Защищенный доступ к цене в UNI с обработкой потенциальных ошибок
          let uniPriceDisplay = '0 UNI';
          try {
            const boostUniPrice = getBoostUniPrice(boost.id);
            if (boostUniPrice && boostUniPrice !== '0') {
              try {
                const priceValue = parseInt(boostUniPrice);
                if (!isNaN(priceValue)) {
                  uniPriceDisplay = `${priceValue.toLocaleString()} UNI`;
                } else {
                  console.warn('[WARNING] BoostPackagesCard - NaN при парсинге цены буста:', boostUniPrice);
                  uniPriceDisplay = `${boostUniPrice} UNI`;
                }
              } catch (parseError) {
                console.error('[ERROR] BoostPackagesCard - Ошибка при форматировании цены буста:', parseError);
                uniPriceDisplay = `${boostUniPrice} UNI`;
              }
            }
          } catch (priceError) {
            console.error('[ERROR] BoostPackagesCard - Ошибка при получении цены буста:', priceError);
          }
          
          return (
            <div 
              key={boost.id} 
              className={`relative bg-gradient-to-br ${boost.color || 'from-blue-500 to-indigo-600'} rounded-xl overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02] group shadow-lg ${boost.popular ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-background z-10' : ''}`}
            >
              {/* Shine effect overlay */}
              <div className="absolute inset-0 bg-white opacity-[0.03] transform rotate-45 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              
              {/* Popular badge */}
              {boost.popular && (
                <div className="absolute -top-1 -right-1 bg-white/90 text-xs font-medium px-2 py-1 rounded-bl-lg rounded-tr-xl text-purple-700 shadow-md backdrop-blur-sm z-10 transform rotate-12 animate-pulse">
                  Популярный 🔥
                </div>
              )}
              
              <div className="relative p-8 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      {boost.icon}
                    </div>
                    <h3 className="font-bold text-xl text-white">{boost.name}</h3>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white font-bold">{boost.price}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="mb-5 space-y-4 flex-grow backdrop-blur-[2px]">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/10">
                    <span className="text-sm text-white/80 flex items-center gap-2 min-w-[120px]">
                      <TrendingUp size={14} className="text-white/70" />
                      Доход в TON:
                    </span>
                    <span className="text-white font-semibold text-right">{boost.tonDailyYield}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/10">
                    <span className="text-sm text-white/80 flex items-center gap-2 min-w-[120px]">
                      <Sparkles size={14} className="text-white/70" />
                      Бонус UNI:
                    </span>
                    <span className="text-white font-semibold text-right">{boost.uniBonus}</span>
                  </div>
                  

                </div>
                
                {/* Button */}
                <button 
                  className="w-full py-3 px-4 rounded-lg font-medium bg-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/20 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  disabled={purchasingBoostId === boost.id}
                  onClick={() => handleBuyBoost(boost.id)}
                >
                  {purchasingBoostId === boost.id ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Покупка...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="opacity-80" />
                      <span>Buy Boost</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BoostPackagesCard;