import { api } from '@utils';
import { useState } from 'react';
import { useGlobalAlertContext } from '@contexts';
import { ALERT_TYPES } from '@constants';

export const TestErrorHandler = () => {
  const [loading, setLoading] = useState({});
  const { showAlert } = useGlobalAlertContext();

  const testCases = [
    {
      name: 'Manual Error Alert',
      path: 'manual-error',
      description: 'Triggers error alert with custom message',
      customHandler: () => {
        showAlert(ALERT_TYPES.ERROR_ALERT, {
          children:
            'This is a test error message. You can close this alert by clicking the X button, clicking outside the alert, or waiting for it to auto-dismiss.',
        });
      },
    },
    {
      name: 'Manual Success Alert',
      path: 'manual-success',
      description: 'Triggers success alert with custom message',
      customHandler: () => {
        showAlert(ALERT_TYPES.SUCCESS_ALERT, {
          children:
            'This is a test success message. You can close this alert by clicking the X button, clicking outside the alert, or waiting for it to auto-dismiss.',
        });
      },
    },
    {
      name: 'Test 503 Service Unavailable',
      path: 'test/test-503',
      description: 'Simulates a server overload situation',
    },
    {
      name: 'Test 400 Bad Request',
      path: 'test/test-400',
      description: 'Simulates a validation error',
    },
    {
      name: 'Test 401 Unauthorized',
      path: 'test/test-401',
      description: 'Simulates an authentication error',
    },
    {
      name: 'Test 404 Not Found',
      path: 'test/test-404',
      description: 'Simulates a resource not found error',
    },
    {
      name: 'Test Network Error',
      path: 'test/test-network-error',
      description: 'Simulates a network connectivity issue',
    },
  ];

  const handleTest = async (testCase) => {
    try {
      if (testCase.customHandler) {
        testCase.customHandler();
        return;
      }

      setLoading((prev) => ({ ...prev, [testCase.path]: true }));
      await api.get({ path: testCase.path });
    } catch (error) {
      // Error will be handled by global handler
      console.log('Test case error:', error);
    } finally {
      setLoading((prev) => ({ ...prev, [testCase.path]: false }));
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">API Error Handler Test Suite</h1>
      <div className="grid gap-4">
        {testCases.map((testCase) => (
          <div
            key={testCase.path}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <h3 className="text-xl font-semibold mb-2">{testCase.name}</h3>
            <p className="text-gray-600 mb-4">{testCase.description}</p>
            <button
              onClick={() => handleTest(testCase)}
              disabled={loading[testCase.path]}
              className={`px-4 py-2 rounded ${
                loading[testCase.path]
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {loading[testCase.path] ? 'Testing...' : 'Run Test'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
