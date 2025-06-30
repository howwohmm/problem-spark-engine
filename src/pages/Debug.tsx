
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const Debug = () => {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase.from('ideas').select('*').limit(5);
      
      if (error) {
        setTestResults(prev => ({
          ...prev,
          supabase: { success: false, error: error.message }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          supabase: { success: true, count: data?.length || 0, sample: data }
        }));
      }
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        supabase: { success: false, error: 'Connection failed' }
      }));
    }
  };

  const testFetchIdeasAPI = async () => {
    try {
      console.log('Testing fetchIdeas API...');
      setLoading(true);
      
      const response = await fetch('/api/fetchIdeas', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        fetchAPI: { success: true, result }
      }));
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        fetchAPI: { success: false, error: err.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  const clearDatabase = async () => {
    try {
      const { error } = await supabase.from('ideas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) {
        alert('Error clearing database: ' + error.message);
      } else {
        alert('Database cleared successfully');
        setTestResults({});
      }
    } catch (err) {
      alert('Failed to clear database');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">System Debug Panel</h1>
        
        <div className="space-y-6">
          {/* Test Supabase Connection */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">1. Test Supabase Database</h2>
            <Button onClick={testSupabaseConnection} className="mb-4">
              Check Database Connection
            </Button>
            
            {testResults.supabase && (
              <div className={`p-4 rounded ${testResults.supabase.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className="font-semibold">
                  {testResults.supabase.success ? '✅ Connected' : '❌ Failed'}
                </h3>
                {testResults.supabase.success ? (
                  <div>
                    <p>Found {testResults.supabase.count} ideas in database</p>
                    {testResults.supabase.sample && testResults.supabase.sample.length > 0 && (
                      <details className="mt-2">
                        <summary>Sample data:</summary>
                        <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                          {JSON.stringify(testResults.supabase.sample[0], null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ) : (
                  <p>Error: {testResults.supabase.error}</p>
                )}
              </div>
            )}
          </div>

          {/* Test API Endpoint */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">2. Test Data Fetching API</h2>
            <p className="text-sm text-gray-600 mb-4">
              This will fetch data from Reddit/HN, process with Gemini, and store in database
            </p>
            <Button 
              onClick={testFetchIdeasAPI} 
              disabled={loading}
              className="mb-4"
            >
              {loading ? 'Fetching Data...' : 'Run Data Fetch Test'}
            </Button>
            
            {testResults.fetchAPI && (
              <div className={`p-4 rounded ${testResults.fetchAPI.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className="font-semibold">
                  {testResults.fetchAPI.success ? '✅ API Working' : '❌ API Failed'}
                </h3>
                {testResults.fetchAPI.success ? (
                  <div>
                    <p>Status: {testResults.fetchAPI.result.status}</p>
                    <p>Processed: {testResults.fetchAPI.result.processed} items</p>
                    <p>Inserted: {testResults.fetchAPI.result.inserted} ideas</p>
                  </div>
                ) : (
                  <p>Error: {testResults.fetchAPI.error}</p>
                )}
              </div>
            )}
          </div>

          {/* Database Management */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">3. Database Management</h2>
            <div className="space-x-4">
              <Button onClick={testSupabaseConnection} variant="outline">
                Refresh Data Count
              </Button>
              <Button onClick={clearDatabase} variant="destructive">
                Clear All Data
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="border rounded-lg p-6 bg-blue-50">
            <h2 className="text-xl font-semibold mb-4">How This Should Work:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong>Database Test:</strong> Should connect and show current idea count</li>
              <li><strong>API Test:</strong> Should fetch from Reddit/HN, process with Gemini, store results</li>
              <li><strong>Check main site:</strong> Go back to homepage to see new ideas displayed</li>
            </ol>
            
            <div className="mt-4 p-4 bg-yellow-100 rounded">
              <h3 className="font-semibold">Current Cron Schedule:</h3>
              <p>Your API runs automatically every 6 hours (vercel.json)</p>
              <p>Use the test button above to manually trigger it now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debug;
