import React, { useState } from 'react';
import StockInput from './components/StockInput';
import ComparisonTable from './components/ComparisonTable';

function App() {
  const [tickers, setTickers] = useState([]);
  const [view, setView] = useState('home'); // 'home' | 'dashboard'

  const handleAnalyze = () => {
    setView('dashboard');
  };

  const handleBack = () => {
    setView('home');
    setTickers([]);
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {view === 'home' ? (
          <StockInput
            tickers={tickers}
            setTickers={setTickers}
            onAnalyze={handleAnalyze}
          />
        ) : (
          <ComparisonTable
            tickers={tickers}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}

export default App;
