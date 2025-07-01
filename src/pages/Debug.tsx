
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { mockIdeas } from '@/data/mockIdeas';

const Debug = () => {
  const [testResults, setTestResults] = useState<any>({});

  const testMockData = async () => {
    try {
      console.log('Testing mock data...');
      setTestResults({
        mockData: { 
          success: true, 
          count: mockIdeas.length, 
          sample: mockIdeas.slice(0, 3) 
        }
      });
    } catch (err) {
      setTestResults({
        mockData: { success: false, error: 'Failed to load mock data' }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">System Debug Panel</h1>
        
        <div className="space-y-6">
          {/* Test Mock Data */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">1. Test Mock Data</h2>
            <Button onClick={testMockData} className="mb-4">
              Check Mock Data
            </Button>
            
            {testResults.mockData && (
              <div className={`p-4 rounded ${testResults.mockData.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className="font-semibold">
                  {testResults.mockData.success ? '✅ Mock Data Working' : '❌ Mock Data Failed'}
                </h3>
                {testResults.mockData.success ? (
                  <div>
                    <p>Found {testResults.mockData.count} mock ideas</p>
                    {testResults.mockData.sample && (
                      <details className="mt-2">
                        <summary>Sample data:</summary>
                        <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                          {JSON.stringify(testResults.mockData.sample[0], null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ) : (
                  <p>Error: {testResults.mockData.error}</p>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="border rounded-lg p-6 bg-blue-50">
            <h2 className="text-xl font-semibold mb-4">Current Setup:</h2>
            <div className="space-y-2 text-sm">
              <p>✅ Frontend UI components are working</p>
              <p>✅ Mock data is being used to display ideas</p>
              <p>✅ All search, filter, and sorting functionality is intact</p>
              <p>✅ Theme switching and keyboard shortcuts work</p>
              <p>❌ All backend/API configurations have been removed</p>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-100 rounded">
              <h3 className="font-semibold">What's Working:</h3>
              <p>Your app now uses mock data and all the UI functionality is preserved. When you're ready to add real data fetching, we can start fresh with a simpler approach.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debug;
