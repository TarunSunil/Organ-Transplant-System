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
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Filter matches by score and recent days
  const filteredMatches = recentMatches.filter(match => {
    const matchDate = new Date(match.time);
    const today = new Date();
    const withinDays = recentDays > 0 ? (today.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24) <= recentDays : true;
    return match.score >= minScore && withinDays;
  });

  // Search by donor/recipient
  const searchedMatches = filteredMatches.filter(match =>
    match.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLast = currentPage * matchesPerPage;
  const indexOfFirst = indexOfLast - matchesPerPage;
  const currentMatches = searchedMatches.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(searchedMatches.length / matchesPerPage);

  return (
    <div className="min-h-screen bg-apple-gray">
      <div className="flex">
        <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <button
              onClick={fetchDashboardData}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats && (
              <>
                <Card>
                  <p className="text-gray-500 text-sm">Total Logs</p>
                  <p className="text-3xl font-bold mt-1">{stats.total_logs}</p>
                </Card>
                <Card>
                  <p className="text-gray-500 text-sm">Active Recipients</p>
                  <p className="text-3xl font-bold mt-1">{stats.active_recipients}</p>
                </Card>
                <Card>
                  <p className="text-gray-500 text-sm">Pending Matches</p>
                  <p className="text-3xl font-bold mt-1">{stats.pending_matches}</p>
                </Card>
                <Card>
                  <p className="text-gray-500 text-sm">Successful Transplants</p>
                  <p className="text-3xl font-bold mt-1">{stats.successful_transplants}</p>
                </Card>
              </>
            )}
          </div>

          {/* Stats chart */}
<Card className="mb-8">
  <h2 className="text-xl font-semibold mb-4">Match Overview</h2>
  {stats && (
    <div className="mx-auto" style={{ width: 400, height: 200 }}> {/* narrower width */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={[
          { name: 'Pending', value: stats.pending_matches },
          { name: 'Successful', value: stats.successful_transplants },
        ]}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#4ade80" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )}
</Card>



          {/* Filters */}
<div className="flex gap-4 mb-4 items-center">
  <div className="flex flex-col">
    <label className="text-gray-700 text-sm mb-1">Min Score (%)</label>
    <input
      type="number"
      placeholder="e.g. 80"
      value={minScore}
      onChange={(e) => setMinScore(Number(e.target.value))}
      className="border px-2 py-1 rounded w-24"
    />
  </div>

  <div className="flex flex-col">
    <label className="text-gray-700 text-sm mb-1">Recent Days</label>
    <input
      type="number"
      placeholder="e.g. 7"
      value={recentDays}
      onChange={(e) => setRecentDays(Number(e.target.value))}
      className="border px-2 py-1 rounded w-32"
    />
  </div>

  <div className="flex flex-col flex-1">
    <label className="text-gray-700 text-sm mb-1">Search Donor/Recipient</label>
    <input
      type="text"
      placeholder="Type name..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="border px-2 py-1 rounded w-full"
    />
  </div>
</div>


          {/* Recent matches table */}
          <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMatches.map((match) => (
                    <motion.tr
                      key={match.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className={match.score > 90 ? "bg-green-50" : ""}
                    >
                      <td className="px-6 py-4">{match.donor}</td>
                      <td className="px-6 py-4">{match.recipient}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          match.score > 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {match.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(match.time).toLocaleString() || "Invalid Date"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1">{currentPage} / {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
