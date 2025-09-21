import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import DarkModeToggle from './components/common/DarkModeToggle';
import Dashboard from './pages/Dashboard';
import DonorManagement from './pages/DonorManagement';
import RecipientManagement from './pages/RecipientManagement';
import MatchDonor from './pages/Matchdonor'; // import your match page
import TransportPage from './pages/TransportPage';
import Logs from './pages/Logs';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-apple-gray dark:bg-gray-900 transition-colors duration-300">
          <DarkModeToggle />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/donors" element={<DonorManagement />} />
            <Route path="/recipients" element={<RecipientManagement />} />
            <Route path="/matching" element={<MatchDonor />} /> {/* add this */}
            <Route path="/transport" element={<TransportPage />} />
            <Route path="/logs" element={<Logs />} /> {}
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
