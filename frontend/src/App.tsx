import { useState } from 'react';
import { DEMO_USERS } from './types';
import { DiscoverPage } from './pages/DiscoverPage';
import { RewardsPage } from './pages/RewardsPage';
import './App.css';

type Tab = 'discover' | 'rewards';

function App() {
  const [tab, setTab] = useState<Tab>('discover');
  const [userId, setUserId] = useState(DEMO_USERS[0].id);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__brand-mark">buka</span>
          <span className="app__brand-sub">LocalBuka discovery</span>
        </div>
        <nav className="app__nav">
          <button className={tab === 'discover' ? 'is-active' : ''} onClick={() => setTab('discover')}>
            Discover
          </button>
          <button className={tab === 'rewards' ? 'is-active' : ''} onClick={() => setTab('rewards')}>
            Rewards
          </button>
        </nav>
        <select
          className="app__user-select"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          aria-label="Demo user"
        >
          {DEMO_USERS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </header>

      <main className="app__main">
        {tab === 'discover' ? <DiscoverPage userId={userId} /> : <RewardsPage userId={userId} />}
      </main>
    </div>
  );
}

export default App;
