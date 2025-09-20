import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  // Mock data
  const stats = [
    { id: 1, title: 'Available Organs', value: 32, change: '+5', color: 'bg-medical-green' },
    { id: 2, title: 'Active Recipients', value: 78, change: '+12', color: 'bg-apple-blue' },
    { id: 3, title: 'Pending Matches', value: 24, change: '-3', color: 'bg-medical-yellow' },
    { id: 4, title: 'Successful Transplants', value: 156, change: '+2', color: 'bg-medical-green' }
  ];

  const recentMatches = [
    { id: 1, donor: 'John D.', recipient: 'Maria R.', organ: 'Kidney', score: 95, time: '2h ago' },
    { id: 2, donor: 'Sarah T.', recipient: 'Robert K.', organ: 'Liver', score: 87, time: '5h ago' },
    { id: 3, donor: 'Michael B.', recipient: 'Sophia J.', organ: 'Heart', score: 92, time: '1d ago' },
  ];

  return (
    <div className="min-h-screen bg-apple-gray">
      <div className="flex">
        <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-3 h-12 rounded-full ${stat.color}`}></div>
                  </div>
                  <div className="mt-4">
                    <span className={`text-sm ${stat.change.startsWith('+') ? 'text-medical-green' : 'text-medical-red'}`}>
                      {stat.change} since yesterday
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Recent matches */}
          <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentMatches.map((match) => (
                    <motion.tr 
                      key={match.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: match.id * 0.1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">{match.donor}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{match.recipient}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{match.organ}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          match.score > 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {match.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{match.time}</td>
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