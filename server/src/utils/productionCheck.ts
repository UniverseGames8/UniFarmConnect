import { db } from '../db';
import { users, missions, transactions } from '../db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 ПРОВЕРКА ГОТОВНОСТИ К ПРОДАКШЕНУ\n');

async function checkDatabaseConnection() {
  console.log('1. Проверка подключения к базе данных...');
  
  try {
    const result = await db.select().from(users).limit(1);
    console.log('✅ База данных: Подключение установлено');
    console.log('✅ Схема: Таблицы доступны');
    return true;
  } catch (error: any) {
    console.error('❌ База данных недоступна:', error.message);
    return false;
  }
}

async function checkEnvironmentVariables() {
  console.log('\n2. Проверка переменных окружения...');
  
  const required = [
    'DATABASE_URL',
    'PORT',
    'NODE_ENV',
    'CORS_ORIGIN'
  ];
  
  const missing = [];
  const present = [];
  
  required.forEach(key => {
    if (process.env[key]) {
      present.push(key);
    } else {
      missing.push(key);
    }
  });
  
  present.forEach(key => {
    console.log(`✅ ${key}: Установлена`);
  });
  
  missing.forEach(key => {
    console.log(`❌ ${key}: Отсутствует`);
  });
  
  return missing.length === 0;
}

async function checkDataIntegrity() {
  console.log('\n3. Проверка целостности данных...');
  
  try {
    // Проверяем наличие активных миссий
    const activeMissions = await db
      .select()
      .from(missions)
      .where(eq(missions.status, 'active'));
    
    console.log(`✅ Активные миссии: ${activeMissions.length} найдено`);
    
    // Проверяем пользователей
    const userCount = await db.select().from(users).limit(10);
    console.log(`✅ Пользователи: ${userCount.length} записей доступно`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Ошибка проверки данных:', error.message);
    return false;
  }
}

async function checkAPIEndpoints() {
  console.log('\n4. Проверка API эндпоинтов...');
  
  const port = process.env.PORT || '3000';
  const endpoints = [
    `http://localhost:${port}/health`,
    `http://localhost:${port}/api/v2/users`,
    `http://localhost:${port}/api/v2/missions`,
    `http://localhost:${port}/api/v2/farming`
  ];
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (response.status < 500) {
        console.log(`✅ ${endpoint}: Отвечает (${response.status})`);
        successCount++;
      } else {
        console.log(`⚠️  ${endpoint}: Ошибка сервера (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Недоступен`);
    }
  }
  
  return successCount === endpoints.length;
}

async function checkBusinessLogic() {
  console.log('\n5. Проверка бизнес-логики...');
  
  try {
    // Тест создания пользователя
    const testUser = await db
      .insert(users)
      .values({
        guest_id: 'test_' + Date.now(),
        ref_code: 'PROD_TEST',
        balance_uni: '0',
        balance_ton: '0'
      })
      .returning();
    
    console.log('✅ Создание пользователя: Работает');
    
    // Тест создания транзакции
    const testTransaction = await db
      .insert(transactions)
      .values({
        user_id: testUser[0].id,
        type: 'test',
        amount: '1.000000',
        currency: 'UNI',
        status: 'pending'
      })
      .returning();
    
    console.log('✅ Создание транзакции: Работает');
    
    // Очистка тестовых данных
    await db.delete(transactions).where(eq(transactions.id, testTransaction[0].id));
    await db.delete(users).where(eq(users.id, testUser[0].id));
    
    console.log('✅ Очистка тестовых данных: Выполнена');
    
    return true;
  } catch (error: any) {
    console.error('❌ Ошибка бизнес-логики:', error.message);
    return false;
  }
}

async function checkSecurity() {
  console.log('\n6. Проверка безопасности...');
  
  let securityScore = 0;
  const maxScore = 3;
  
  // Проверка режима работы
  if (process.env.NODE_ENV === 'production') {
    console.log('✅ Режим продакшена активирован');
    securityScore++;
  } else {
    console.log('⚠️  Режим разработки (измените NODE_ENV=production)');
  }
  
  // Проверка CORS настроек
  if (process.env.CORS_ORIGIN) {
    console.log('✅ CORS настроен');
    securityScore++;
  } else {
    console.log('⚠️  CORS не настроен');
  }
  
  // Проверка порта
  if (process.env.PORT && process.env.PORT !== '3000') {
    console.log('✅ Порт изменен с дефолтного');
    securityScore++;
  } else {
    console.log('⚠️  Используется дефолтный порт');
  }
  
  return securityScore >= maxScore * 0.75; // 75% требований безопасности
}

export async function runProductionCheck() {
  console.log('════════════════════════════════════════════════════════');
  console.log('🚀 UNIFARM - ПРОВЕРКА ГОТОВНОСТИ К ПРОДАКШЕНУ');
  console.log('════════════════════════════════════════════════════════\n');
  
  const checks = [
    { name: 'База данных', test: checkDatabaseConnection },
    { name: 'Переменные окружения', test: checkEnvironmentVariables },
    { name: 'Целостность данных', test: checkDataIntegrity },
    { name: 'API эндпоинты', test: checkAPIEndpoints },
    { name: 'Бизнес-логика', test: checkBusinessLogic },
    { name: 'Безопасность', test: checkSecurity }
  ];
  
  const results = [];
  
  for (const check of checks) {
    const result = await check.test();
    results.push({ name: check.name, passed: result });
  }
  
  // Итоговый отчет
  console.log('\n════════════════════════════════════════════════════════');
  console.log('📊 ИТОГОВЫЙ ОТЧЕТ ГОТОВНОСТИ');
  console.log('════════════════════════════════════════════════════════');
  
  const passedChecks = results.filter(r => r.passed).length;
  const totalChecks = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ ПРОШЕЛ' : '❌ ПРОВАЛЕН';
    console.log(`${status} - ${result.name}`);
  });
  
  console.log(`\n🎯 Общий результат: ${passedChecks}/${totalChecks} проверок пройдено`);
  
  const readinessPercentage = Math.round((passedChecks / totalChecks) * 100);
  console.log(`📈 Готовность к продакшену: ${readinessPercentage}%`);
  
  if (readinessPercentage >= 85) {
    console.log('\n🎉 ПРОЕКТ ГОТОВ К ПРОДАКШЕНУ!');
    console.log('✅ Можно работать с живыми пользователями');
  } else if (readinessPercentage >= 70) {
    console.log('\n⚠️  ПРОЕКТ ПОЧТИ ГОТОВ К ПРОДАКШЕНУ');
    console.log('🔧 Необходимо устранить критические проблемы');
  } else {
    console.log('\n❌ ПРОЕКТ НЕ ГОТОВ К ПРОДАКШЕНУ');
    console.log('🛠️  Требуется серьезная доработка');
  }
  
  return readinessPercentage;
} 