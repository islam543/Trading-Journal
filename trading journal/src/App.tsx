import { useState } from 'react';
import Layout from './components/Layout';
import TradeJournal from './pages/TradeJournal';
import News from './pages/News';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import MacroAnalysis from './pages/MacroAnalysis';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'journal':
        return <JournalPage />;
      case 'news':
        return <News />;
      case 'macro':
        return <MacroAnalysis />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activePage={activePage} onPageChange={setActivePage}>
      {renderPage()}
    </Layout>
  );
}

function JournalPage() {
  return <TradeJournal />;
}

export default App;

