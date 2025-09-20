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
    <div className="min-h-screen flex bg-apple-gray">
      <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-4">Allocation Logs</h1>

        <Card className="p-4">
          {loading && <p>Loading logs...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && logs.length === 0 && <p>No logs found.</p>}

          {logs.length > 0 && (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border p-2">Log ID</th>
                  <th className="border p-2">Donor ID</th>
                  <th className="border p-2">Recipient ID</th>
                  <th className="border p-2">Match Score</th>
                  <th className="border p-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="border p-2">{log.id}</td>
                    <td className="border p-2">{log.donor_id}</td>
                    <td className="border p-2">{log.recipient_id}</td>
                    <td className="border p-2">{log.match_score}</td>
                    <td className="border p-2">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Logs;
