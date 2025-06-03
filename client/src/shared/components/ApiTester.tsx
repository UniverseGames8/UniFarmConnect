import { useEffect, useState } from 'react';
import { apiClient } from '@/core/api/client';
import { useTelegram } from '@/shared/hooks/useTelegram';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export const ApiTester = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const { initData } = useTelegram();

  const testEndpoint = async (endpoint: string): Promise<TestResult> => {
    try {
      const { data, status } = await apiClient.get(endpoint);
      return {
        endpoint,
        status: 'success',
        message: `Status: ${status}`,
        data
      };
    } catch (error: any) {
      return {
        endpoint,
        status: 'error',
        message: error.message || 'Unknown error'
      };
    }
  };

  const runTests = async () => {
    setIsTesting(true);
    setResults([]);

    const endpoints = [
      '/api/v2/dashboard/stats',
      '/api/v2/missions/list',
      '/api/v2/wallet/data',
      '/api/v2/wallet/transactions',
      '/api/v2/farming/data',
      '/api/v2/referral/data',
      '/api/v2/boost/packages'
    ];

    const testResults = await Promise.all(
      endpoints.map(endpoint => testEndpoint(endpoint))
    );

    setResults(testResults);
    setIsTesting(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">API Tests</h2>
        <button
          onClick={runTests}
          disabled={isTesting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded ${
              result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <div className="font-medium">{result.endpoint}</div>
            <div className="text-sm">
              Status: {result.status === 'success' ? '✅' : '❌'}
            </div>
            <div className="text-sm">{result.message}</div>
            {result.data && (
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h3 className="font-medium mb-2">Telegram Data</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({ initData }, null, 2)}
        </pre>
      </div>
    </div>
  );
}; 