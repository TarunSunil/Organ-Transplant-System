import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { motion } from 'framer-motion';
import { recipientService } from '../services/api';

interface Recipient {
  id: number;
  name: string;
  blood_type: string;
  organ_needed: string;
  location: string;
  status: string;
}

const RecipientManagement: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('recipients');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    blood_type: 'A+',
    organ_needed: 'kidney',
    location: '',
    status: 'waiting'
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const organs = ['kidney', 'liver', 'heart', 'lung', 'pancreas', 'intestine'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const recipientsData = await recipientService.getAll();
        // Sort recipients by ID in ascending order
        recipientsData.sort((a: Recipient, b: Recipient) => a.id - b.id);
        setRecipients(recipientsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data if API fails
        const mockRecipients: Recipient[] = [
          { id: 1, name: 'Maria R.', blood_type: 'A+', organ_needed: 'kidney', location: 'New York', status: 'waiting' },
          { id: 2, name: 'Robert K.', blood_type: 'O-', organ_needed: 'liver', location: 'Los Angeles', status: 'waiting' },
        ];
        setRecipients(mockRecipients);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await recipientService.create(formData);
      setRecipients([...recipients, response]);
      setShowForm(false);
      setFormData({ name: '', blood_type: 'A+', organ_needed: 'kidney', location: '', status: 'waiting' });
    } catch (error) {
      console.error('Error creating recipient:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'matched': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
        <main className="flex-1 p-6">
          <div className="flex justify-start items-center mb-6">
            <h1 className="text-3xl font-semibold mr-6 text-apple-dark dark:text-white">Recipient Management</h1>
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="bg-apple-blue text-white hover:bg-blue-600"
              icon="+"
            >
              {showForm ? 'Cancel' : 'Add Recipient'}
            </Button>
          </div>

          {showForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <Card>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Recipient</h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Type</label>
                      <select
                        name="blood_type"
                        value={formData.blood_type}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent"
                      >
                        {bloodTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organ Needed</label>
                      <select
                        name="organ_needed"
                        value={formData.organ_needed}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent"
                      >
                        {organs.map(organ => (
                          <option key={organ} value={organ}>{organ.charAt(0).toUpperCase() + organ.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary">Save Recipient</button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
          <Card>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Blood Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Organ Needed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {recipients.map((recipient: Recipient) => (
                      <motion.tr key={recipient.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{recipient.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{recipient.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{recipient.blood_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{recipient.organ_needed}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{recipient.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recipient.status)}`}>
                            {recipient.status}
                          </span>
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
    </div>
  );
};

export default RecipientManagement;