import React, { useEffect, useState } from "react";
import Sidebar from "../components/common/Sidebar";
import Card from "../components/common/Card";

const API_URL = "http://127.0.0.1:8000"; // Change if your backend runs elsewhere

interface TransportLog {
  id: number;
  allocation_id: number;
  donor_location: string;
  recipient_location: string;
  status: string;
  start_time: string;
  end_time?: string;
  estimated_time_minutes: number;
  suggested_route: string;
}

const TransportPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState("transport");
  const [transports, setTransports] = useState<TransportLog[]>([]);
  const [allocationId, setAllocationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/transport/`);
      if (!res.ok) throw new Error("Failed to fetch transports");
      const data = await res.json();
      setTransports(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch transports");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransports();
  }, []);

  const startTransport = async () => {
    if (!allocationId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/transport/start/${allocationId}`, {
        method: "POST",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to start transport");
      }
      setAllocationId("");
      fetchTransports();
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to start transport");
    }
    setLoading(false);
  };

  const completeTransport = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/transport/complete/${id}`, {
        method: "POST",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to complete transport");
      }
      fetchTransports();
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to complete transport");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors">
      <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
      <main className="flex-1 p-6 text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-apple-dark dark:text-white tracking-tight">Transport Management</h1>

        <Card className="p-5 mb-6 bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allocation ID</label>
              <input
                type="number"
                placeholder="Enter Allocation ID"
                value={allocationId}
                onChange={e => setAllocationId(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/60 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={startTransport}
              disabled={loading || !allocationId}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm transition-colors"
            >
              {loading ? "Starting..." : "Start Transport"}
            </button>
          </div>
        </Card>

        {error && (
          <div className="mb-4 p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
            <span className="text-lg leading-none">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <Card className="p-5 bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">All Transports</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700/60">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Allocation</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Donor Location</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Recipient Location</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ETA (min)</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Route</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No transports found.</td>
                  </tr>
                ) : (
                  transports.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
                      <td className="px-4 py-2 text-sm font-medium">{t.id}</td>
                      <td className="px-4 py-2 text-sm">{t.allocation_id}</td>
                      <td className="px-4 py-2 text-sm">{t.donor_location}</td>
                      <td className="px-4 py-2 text-sm">{t.recipient_location}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'}`}>{t.status}</span>
                      </td>
                      <td className="px-4 py-2 text-sm">{t.estimated_time_minutes}</td>
                      <td className="px-4 py-2 text-sm truncate max-w-xs" title={t.suggested_route}>{t.suggested_route}</td>
                      <td className="px-4 py-2 text-sm">
                        {t.status !== "delivered" && (
                          <button
                            onClick={() => completeTransport(t.id)}
                            className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                          >Complete</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default TransportPage;