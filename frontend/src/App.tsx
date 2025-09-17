import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DonorManagement from './pages/DonorManagement';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/donors" element={<DonorManagement />} />
      </Routes>
    </Router>
  );
};

export default App;