import { useEffect, useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

interface WebSocketTest {
  type: string;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
}

export const WebSocketTester = () => {
  const [tests, setTests] = useState<WebSocketTest[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const { isConnected, lastMessage } = useWebSocket();

  const testConnection = (): WebSocketTest => {
    return {
      type: 'connection',
      status: isConnected ? 'success' : 'error',
      message: isConnected ? 'WebSocket connected' : 'WebSocket disconnected',
      timestamp: new Date().toISOString()
    };
  };

  const testMessageHandling = (): WebSocketTest => {
    if (!lastMessage) {
      return {
        type: 'message_handling',
        status: 'error',
        message: 'No messages received',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const message = JSON.parse(lastMessage);
      return {
        type: 'message_handling',
        status: 'success',
        message: `Received message of type: ${message.type}`,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        type: 'message_handling',
        status: 'error',
        message: `Failed to parse message: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  };

  const runTests = () => {
    setIsTesting(true);
    setTests([]);

    const connectionTest = testConnection();
    setTests(prev => [...prev, connectionTest]);

    if (connectionTest.status === 'success') {
      const messageTest = testMessageHandling();
      setTests(prev => [...prev, messageTest]);
    }

    setIsTesting(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">WebSocket Tests</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
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
            <div className="font-medium">{test.type}</div>
            <div className="text-sm">
              Status: {test.status === 'success' ? '✅' : '❌'}
            </div>
            <div className="text-sm">{test.message}</div>
            <div className="text-xs text-gray-500">{test.timestamp}</div>
          </div>
        ))}
      </div>

      {lastMessage && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Last Message</h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(JSON.parse(lastMessage), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}; 