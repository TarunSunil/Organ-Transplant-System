import React, { useEffect, useState } from "react";
import Sidebar from "../components/common/Sidebar";
import Card from "../components/common/Card";

interface Log {
  id: number;
  donor_id: number;
  recipient_id: number;
  match_score: number;
  timestamp: string;
}

const Logs: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState("logs");
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:8000/logs/");
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        setLogs(data);
      } catch (err: any) {
        setError(err.message || "Error fetching logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors">
      <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
      <main className="flex-1 p-6 text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-semibold mb-6 text-apple-dark dark:text-white tracking-tight">Allocation Logs</h1>
        <Card className="bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 shadow-sm">
          {loading && (
            <div className="flex justify-center items-center h-56">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-600 border-t-blue-500"></div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex gap-2">
              <span className="text-lg leading-none">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}
          {!loading && logs.length === 0 && (
            <p className="text-center py-10 text-gray-500 dark:text-gray-400">No logs found.</p>
          )}
          {logs.length > 0 && (
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Log ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Donor ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Recipient ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Match Score</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{log.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{log.donor_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{log.recipient_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{log.match_score}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Logs;
