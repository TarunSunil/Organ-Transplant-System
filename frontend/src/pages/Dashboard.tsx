import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import { motion } from 'framer-motion';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [minScore, setMinScore] = useState(0);
  const [recentDays, setRecentDays] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 10;

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await axios.get('http://127.0.0.1:8000/dashboard/stats');
      const matchesRes = await axios.get('http://127.0.0.1:8000/dashboard/recent-matches');
      setStats(statsRes.data);
      setRecentMatches(matchesRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
        Loading dashboard...
      </div>
    );
  }

  // Filter matches by score and days
  const filteredMatches = recentMatches.filter(match => {
    const matchDate = new Date(match.time);
    const today = new Date();
    const withinDays = recentDays > 0 ? (today.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24) <= recentDays : true;
    return match.score >= minScore && withinDays;
  });

  // Search filter
  const searchedMatches = filteredMatches.filter(match =>
    match.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLast = currentPage * matchesPerPage;
  const indexOfFirst = indexOfLast - matchesPerPage;
  const currentMatches = searchedMatches.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(searchedMatches.length / matchesPerPage) || 1;

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors">
      <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
      <main className="flex-1 p-6 text-gray-900 dark:text-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-apple-dark dark:text-white tracking-tight">Dashboard</h1>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats && (
            <>
              <Card className="bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Logs</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-gray-100">{stats.total_logs}</p>
              </Card>
              <Card className="bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Active Recipients</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-gray-100">{stats.active_recipients}</p>
              </Card>
              <Card className="bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Pending Matches</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-gray-100">{stats.pending_matches}</p>
              </Card>
              <Card className="bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Successful Transplants</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-gray-100">{stats.successful_transplants}</p>
              </Card>
            </>
          )}
        </div>

        {/* Stats chart */}
        <Card className="mb-10 bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Match Overview</h2>
            {stats && (
              <div className="mx-auto" style={{ width: 400, height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Pending', value: stats.pending_matches },
                    { name: 'Successful', value: stats.successful_transplants },
                  ]}>
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip wrapperStyle={{ outline: 'none' }} contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#f3f4f6' }} />
                    <Bar dataKey="value" fill="#4ade80" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
          <div className="flex flex-col">
            <label className="text-gray-700 dark:text-gray-300 text-sm mb-1">Min Score (%)</label>
            <input
              type="number"
              placeholder="e.g. 80"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/60 text-gray-900 dark:text-gray-100 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 dark:text-gray-300 text-sm mb-1">Recent Days</label>
            <input
              type="number"
              placeholder="e.g. 7"
              value={recentDays}
              onChange={(e) => setRecentDays(Number(e.target.value))}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/60 text-gray-900 dark:text-gray-100 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col flex-1">
            <label className="text-gray-700 dark:text-gray-300 text-sm mb-1">Search Donor/Recipient</label>
            <input
              type="text"
              placeholder="Type name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/60 text-gray-900 dark:text-gray-100 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Recent matches table */}
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Recent Matches</h2>
        <Card className="bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Donor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Match Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentMatches.map(match => (
                  <motion.tr
                    key={match.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className={match.score > 90 ? 'bg-green-50 dark:bg-green-900/20' : ''}
                  >
                    <td className="px-6 py-4">{match.donor}</td>
                    <td className="px-6 py-4">{match.recipient}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${match.score > 90 ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'}`}>{match.score}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(match.time).toLocaleString() || 'Invalid Date'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition"
            >Prev</button>
            <span className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/60 rounded-md">{currentPage} / {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition"
            >Next</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
