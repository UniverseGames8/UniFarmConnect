import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationTest {
  path: string;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
}

export const NavigationTester = () => {
  const [tests, setTests] = useState<NavigationTest[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const testNavigation = async (path: string): Promise<NavigationTest> => {
    try {
      navigate(path);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Ждем загрузки страницы
      
      return {
        path,
        status: 'success',
        message: 'Navigation successful',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        path,
        status: 'error',
        message: error.message || 'Navigation failed',
        timestamp: new Date().toISOString()
      };
    }
  };

  const runTests = async () => {
    setIsTesting(true);
    setTests([]);

    const paths = [
      '/dashboard',
      '/farming',
      '/missions',
      '/wallet',
      '/referral',
      '/boost'
    ];

    for (const path of paths) {
      const result = await testNavigation(path);
      setTests(prev => [...prev, result]);
      await new Promise(resolve => setTimeout(resolve, 500)); // Пауза между тестами
    }

    setIsTesting(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Navigation Tests</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Current: {location.pathname}
          </div>
          <button
            onClick={runTests}
            disabled={isTesting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isTesting ? 'Testing...' : 'Run Tests'}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {tests.map((test, index) => (
          <div
            key={index}
            className={`p-4 rounded ${
              test.status === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <div className="font-medium">{test.path}</div>
            <div className="text-sm">
              Status: {test.status === 'success' ? '✅' : '❌'}
            </div>
            <div className="text-sm">{test.message}</div>
            <div className="text-xs text-gray-500">{test.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
}; 