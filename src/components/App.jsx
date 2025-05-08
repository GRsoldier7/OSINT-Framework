import React, { useState, useEffect } from 'react';

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check API health
    fetch('/api/health')
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setHealth(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-primary-500 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Ultimate OSINT Framework</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2">Checking system status...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
              <p className="mt-2">
                Make sure the API server is running on port 5000.
              </p>
            </div>
          ) : (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
              <p className="font-bold">API Status: {health?.status}</p>
              <p>Timestamp: {health?.timestamp}</p>
              <p>{health?.message}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Search Engines</h3>
            <p className="text-gray-600 mb-4">
              Search across multiple search engines simultaneously.
            </p>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded">
              Open Tool
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Username Search</h3>
            <p className="text-gray-600 mb-4">
              Find accounts associated with a username across various platforms.
            </p>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded">
              Open Tool
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Email Analysis</h3>
            <p className="text-gray-600 mb-4">
              Analyze email addresses for data breaches, verification status, and more.
            </p>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded">
              Open Tool
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Domain Analysis</h3>
            <p className="text-gray-600 mb-4">
              Get comprehensive domain information including WHOIS, DNS records, and more.
            </p>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded">
              Open Tool
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">IP Analysis</h3>
            <p className="text-gray-600 mb-4">
              Get detailed IP information including geolocation, reputation, and network details.
            </p>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded">
              Open Tool
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-600 mb-4">
              Use AI to extract entities, map relationships, generate search queries, and more.
            </p>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded">
              Open Tool
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>Ultimate OSINT Framework &copy; {new Date().getFullYear()}</p>
          <p className="text-sm text-gray-400 mt-1">
            For legitimate OSINT research and educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
