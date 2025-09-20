import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DonorManagement from './pages/DonorManagement';
import RecipientManagement from './pages/RecipientManagement';
import MatchDonor from './pages/Matchdonor'; // import your match page
import Logs from "./pages/Logs";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/donors" element={<DonorManagement />} />
        <Route path="/recipients" element={<RecipientManagement />} />
        <Route path="/matching" element={<MatchDonor />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </Router>
  );
};

export default App;
