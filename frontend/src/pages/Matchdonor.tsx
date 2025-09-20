import React, { useState } from "react";
import Sidebar from "../components/common/Sidebar";
import Card from "../components/common/Card";

const MatchDonor: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState("matching");
  const [donorId, setDonorId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      // Send donor_id as query parameter
      const res = await fetch(
        `http://localhost:8000/match/ai-match/${donorId}`, // temp recipient_id=1 for demo
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch match");
      }

      const data = await res.json();

      // Try to parse ai_match JSON if it’s in string form
      let parsedMatch = data.ai_match;
      try {
        parsedMatch = JSON.parse(data.ai_match);
      } catch (e) {
        // keep as string if parsing fails
      }

      setResult({ ...data, ai_match: parsedMatch });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-apple-gray">
      <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-4">AI Donor-Recipient Match</h1>

        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-4">
            <input
              type="number"
              placeholder="Enter Donor ID"
              value={donorId}
              onChange={(e) => setDonorId(e.target.value)}
              className="border p-2 rounded"
            />

            <button
              onClick={handleMatch}
              disabled={loading}
              className="bg-apple-blue text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Matching..." : "Match Donor"}
            </button>
          </div>
        </Card>

        {error && (
          <div className="text-red-600 font-medium mb-4">
            ⚠️ {error}
          </div>
        )}

        {result && (
  <Card className="p-4">
    <h2 className="text-xl font-semibold mb-2">Match Result</h2>
    <p><strong>Donor:</strong> {result.donor}</p>
    <p><strong>Recipient:</strong> {result.recipient}</p>

    {(() => {
      let matchData = null;
      if (typeof result.ai_match === "string") {
        try {
          // Remove backticks and 'json' if present
          const cleaned = result.ai_match
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          matchData = JSON.parse(cleaned);
        } catch {
          matchData = null;
        }
      } else if (typeof result.ai_match === "object") {
        matchData = result.ai_match;
      }

      return matchData ? (
        <div className="mt-2 p-4 bg-gray-50 rounded shadow-sm">
          <p className="text-lg"><strong>Match Score:</strong> {matchData.match_score}</p>
          <p className="mt-1"><strong>Reason:</strong> {matchData.reason}</p>
        </div>
      ) : (
        <p className="mt-2">{result.ai_match}</p>
      );
    })()}
  </Card>
)}



      </main>
    </div>
  );
};

export default MatchDonor;
