import { useState } from 'react';
import PlankTimer from './components/PlankTimer';
import Statistics from './components/Statistics';
import './App.css';

type View = 'timer' | 'stats';

function App() {
  const [currentView, setCurrentView] = useState<View>('timer');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const switchToStats = () => {
    setCurrentView('stats');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app">
      <nav className="app-nav">
        <button
          className={`nav-button ${currentView === 'timer' ? 'active' : ''}`}
          onClick={() => setCurrentView('timer')}
        >
          <span className="nav-icon">⏱️</span>
          <span className="nav-label">Timer</span>
        </button>
        <button
          className={`nav-button ${currentView === 'stats' ? 'active' : ''}`}
          onClick={switchToStats}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Stats</span>
        </button>
      </nav>

      <main className="app-main">
        {currentView === 'timer' ? (
          <PlankTimer onSave={handleSave} />
        ) : (
          <Statistics refreshTrigger={refreshTrigger} />
        )}
      </main>
    </div>
  );
}

export default App;
