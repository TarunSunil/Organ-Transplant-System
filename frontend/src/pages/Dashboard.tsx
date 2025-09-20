import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import { motion } from 'framer-motion';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-apple-gray">
      <div className="flex">
        <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

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

          {/* Recent matches */}
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
                  {recentMatches.map((match) => (
                    <motion.tr 
                      key={match.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
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
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
