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
    <div className="min-h-screen flex bg-apple-gray">
      <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-4">Transport Management</h1>

        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-4">
            <input
              type="number"
              placeholder="Enter Allocation ID"
              value={allocationId}
              onChange={e => setAllocationId(e.target.value)}
              className="border p-2 rounded"
            />
            <button
              onClick={startTransport}
              disabled={loading}
              className="bg-apple-blue text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Starting..." : "Start Transport"}
            </button>
          </div>
        </Card>

        {error && (
          <div className="text-red-600 font-medium mb-4">
            ⚠️ {error}
          </div>
        )}

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-2">All Transports</h2>
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Allocation</th>
                <th className="border px-2 py-1">Donor Location</th>
                <th className="border px-2 py-1">Recipient Location</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">ETA (min)</th>
                <th className="border px-2 py-1">Route</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">No transports found.</td>
                </tr>
              ) : (
                transports.map(t => (
                  <tr key={t.id}>
                    <td className="border px-2 py-1">{t.id}</td>
                    <td className="border px-2 py-1">{t.allocation_id}</td>
                    <td className="border px-2 py-1">{t.donor_location}</td>
                    <td className="border px-2 py-1">{t.recipient_location}</td>
                    <td className="border px-2 py-1">{t.status}</td>
                    <td className="border px-2 py-1">{t.estimated_time_minutes}</td>
                    <td className="border px-2 py-1">{t.suggested_route}</td>
                    <td className="border px-2 py-1">
                      {t.status !== "delivered" && (
                        <button
                          onClick={() => completeTransport(t.id)}
                          className="bg-green-600 text-white px-2 py-1 rounded"
                          disabled={loading}
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
};

export default TransportPage;