import { useState } from 'react';
import PlankTimer from './components/PlankTimer';
import PushupTracker from './components/PushupTracker';
import Statistics from './components/Statistics';
import './App.css';

type View = 'timer' | 'pushups' | 'stats';

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
          <span className="nav-label">Plank</span>
        </button>
        <button
          className={`nav-button ${currentView === 'pushups' ? 'active' : ''}`}
          onClick={() => setCurrentView('pushups')}
        >
          <span className="nav-icon">💪</span>
          <span className="nav-label">Pushups</span>
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
        <div className={`view-container ${currentView === 'timer' ? '' : 'hidden'}`}>
          <PlankTimer onSave={handleSave} />
        </div>
        <div className={`view-container ${currentView === 'pushups' ? '' : 'hidden'}`}>
          <PushupTracker onSave={handleSave} />
        </div>
        <div className={`view-container ${currentView === 'stats' ? '' : 'hidden'}`}>
          <Statistics refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
}

export default App;
