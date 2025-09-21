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
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors">
      <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
      <main className="flex-1 p-6 text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-semibold mb-6 text-apple-dark dark:text-white tracking-tight">AI Donor-Recipient Match</h1>

        <Card className="p-5 mb-6 bg-white dark:bg-gray-800/70 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Donor ID</label>
              <input
                type="number"
                placeholder="Enter Donor ID"
                value={donorId}
                onChange={(e) => setDonorId(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/60 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <button
              onClick={handleMatch}
              disabled={loading || !donorId}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm transition-colors"
            >
              {loading ? "Matching..." : "Match Donor"}
            </button>
          </div>
        </Card>

        {error && (
          <div className="mb-4 p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
            <span className="text-lg leading-none">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-6 items-center">
            <Card className="p-6 max-w-2xl w-full bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Best Allocation Result</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Donor:</span> {result.donor}</p>
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Selected Recipient:</span> {result.recipient ?? '—'}</p>
              </div>
              {(() => {
                let matchData = null;
                if (typeof result.ai_match === "string") {
                  try {
                    const cleaned = result.ai_match.replace(/```json/g, "").replace(/```/g, "").trim();
                    matchData = JSON.parse(cleaned);
                  } catch {
                    matchData = null;
                  }
                } else if (typeof result.ai_match === "object") {
                  matchData = result.ai_match;
                }
                return matchData && matchData.match_score ? (
                  <div className="mt-4 p-4 rounded-md bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600">
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100"><span className="font-medium">Match Score:</span> {matchData.match_score}</p>
                    {matchData.reason && <p className="mt-1 text-sm text-gray-700 dark:text-gray-300"><span className="font-medium">Reason:</span> {matchData.reason}</p>}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{typeof result.ai_match === 'string' ? result.ai_match : 'No detailed score available.'}</p>
                );
              })()}
            </Card>

            {Array.isArray(result.top_matches) && result.top_matches.length > 0 && (
              <Card className="p-6 max-w-3xl w-full bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Top 3 Candidate Matches</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700/60">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Rank</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Recipient</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Score</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {result.top_matches.map((m: any, idx: number) => (
                        <tr key={m.recipient_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors align-top">
                          <td className="px-4 py-2 font-medium">{idx + 1}</td>
                          <td className="px-4 py-2">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{m.recipient_name}</div>
                            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 space-x-2">
                              {m.blood_type && <span>Blood: <span className="font-semibold">{m.blood_type}</span></span>}
                              {m.organ_needed && <span>Organ: <span className="font-semibold">{m.organ_needed}</span></span>}
                              {typeof m.urgency_level === 'number' && <span>Urgency: <span className="font-semibold">{m.urgency_level}</span></span>}
                              {m.location && <span>Loc: <span className="font-semibold">{m.location}</span></span>}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.match_score > 90 ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'}`}>{m.match_score}</span>
                          </td>
                          <td className="px-4 py-2 text-gray-600 dark:text-gray-300 max-w-sm truncate" title={m.reason}>{m.reason || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MatchDonor;
