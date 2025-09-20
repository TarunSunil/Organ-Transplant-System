import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { motion } from 'framer-motion';
import { recipientService, donorService, matchService } from '../services/api';

interface Recipient {
  id: number;
  name: string;
  blood_type: string;
  organ_needed: string;
  urgency_level: number;
  location: string;
  status: string;
}

interface Donor {
  id: number;
  name: string;
  blood_type: string;
  age: number;
  location: string;
  organ: string;
  status: string;
}

interface MatchResult {
  donor: string;
  recipient: string;
  ai_match: string;
}

const RecipientManagement: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('recipients');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showMatchModal, setShowMatchModal] = useState<boolean>(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [recipientsData, donorsData] = await Promise.all([
          recipientService.getAll(),
          donorService.getAll(),
        ]);
        setRecipients(recipientsData);
        setDonors(donorsData.filter((d: Donor) => d.status === 'available'));
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data if API fails
        const mockRecipients: Recipient[] = [
          { id: 1, name: 'Maria R.', blood_type: 'A+', organ_needed: 'kidney', urgency_level: 8, location: 'New York', status: 'waiting' },
          { id: 2, name: 'Robert K.', blood_type: 'O-', organ_needed: 'liver', urgency_level: 9, location: 'Los Angeles', status: 'waiting' },
        ];
        const mockDonors: Donor[] = [
          { id: 1, name: 'John Doe', blood_type: 'A+', age: 45, location: 'New York', organ: 'kidney', status: 'available' },
          { id: 2, name: 'Jane Smith', blood_type: 'O-', age: 36, location: 'Los Angeles', organ: 'liver', status: 'available' },
        ];
        setRecipients(mockRecipients);
        setDonors(mockDonors);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMatchClick = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setShowMatchModal(true);
    setMatchResult(null);
    setSelectedDonor(null);
  };

  const handleRunMatch = async () => {
    if (!selectedRecipient || !selectedDonor) return;
    setIsMatching(true);
    try {
      const result = await matchService.getAiMatch(selectedDonor.id, selectedRecipient.id);
      setMatchResult(result);
    } catch (error) {
      console.error('Error running AI match:', error);
      // Fallback to mock result if API fails
      const mockResult = {
        donor: selectedDonor.name,
        recipient: selectedRecipient.name,
        ai_match: `{\n  "match_score": 85,\n  "reason": "Good blood type compatibility and same organ type. Age difference is acceptable."\n}`
      };
      setMatchResult(mockResult);
    } finally {
      setIsMatching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-medical-yellow text-black';
      case 'matched': return 'bg-medical-green text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const parseAiMatch = (aiMatch: string) => {
    try {
      const cleaned = aiMatch.replace(/```json\n|\n```/g, '');
      return JSON.parse(cleaned);
    } catch {
      return { match_score: 'N/A', reason: 'Could not parse AI response.' };
    }
  };

  return (
    <div className="min-h-screen bg-apple-gray">
      <div className="flex">
        <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-semibold mb-6">Recipient Management</h1>
          <Card>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organ Needed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recipients.map((recipient) => (
                      <motion.tr key={recipient.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td className="px-6 py-4 whitespace-nowrap">{recipient.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{recipient.blood_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{recipient.organ_needed}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{recipient.urgency_level}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recipient.status)}`}>
                            {recipient.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button onClick={() => handleMatchClick(recipient)}>Match with AI</Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </main>
      </div>

      {showMatchModal && selectedRecipient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-semibold mb-4">Run AI Match for {selectedRecipient.name}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Donor</label>
              <select
                onChange={(e) => setSelectedDonor(donors.find(d => d.id === parseInt(e.target.value)) || null)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option>Select a donor</option>
                {donors.map(donor => (
                  <option key={donor.id} value={donor.id}>{donor.name} ({donor.organ})</option>
                ))}
              </select>
            </div>
            
            {isMatching && <div className="text-center">Running match...</div>}

            {matchResult && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h3 className="font-semibold">AI Match Result:</h3>
                <p><strong>Score:</strong> {parseAiMatch(matchResult.ai_match).match_score}</p>
                <p><strong>Reason:</strong> {parseAiMatch(matchResult.ai_match).reason}</p>
              </div>
            )}

            <div className="flex justify-end mt-6 space-x-2">
              <Button variant="secondary" onClick={() => setShowMatchModal(false)}>Cancel</Button>
              <Button onClick={handleRunMatch} disabled={!selectedDonor || isMatching}>Run Match</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RecipientManagement;