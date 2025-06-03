import { useNotification } from '../context/NotificationContext';

export const NotificationTester = () => {
  const { addNotification } = useNotification();

  const testNotifications = () => {
    // Test success notification
    addNotification('success', 'This is a success notification');

    // Test error notification
    setTimeout(() => {
      addNotification('error', 'This is an error notification');
    }, 1000);

    // Test warning notification
    setTimeout(() => {
      addNotification('warning', 'This is a warning notification');
    }, 2000);

    // Test info notification
    setTimeout(() => {
      addNotification('info', 'This is an info notification');
    }, 3000);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Notification Tests</h2>
        <button
          onClick={testNotifications}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Notifications
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-medium mb-2">Test Cases</h3>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>Success notification (green)</li>
          <li>Error notification (red)</li>
          <li>Warning notification (yellow)</li>
          <li>Info notification (blue)</li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          Notifications will appear in sequence with 1-second intervals.
          Each notification will automatically disappear after 5 seconds.
        </p>
      </div>
    </div>
  );
}; 