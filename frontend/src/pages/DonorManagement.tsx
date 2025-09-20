import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { motion } from 'framer-motion';
import axios from 'axios';

interface Donor {
  id: number;
  name: string;
  blood_type: string;
  age: number;
  location: string;
  organ: string;
  status: string;
}

const DonorManagement: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('donors');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    blood_type: 'A+',
    age: 30,
    location: '',
    organ: 'kidney',
    status: 'available'
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const organs = ['kidney', 'liver', 'heart', 'lung', 'pancreas', 'intestine'];

  // Fetch donors from backend
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<Donor[]>('http://localhost:8000/donors/');
        setDonors(response.data);
      } catch (error) {
        console.error('Error fetching donors:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonors();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'age' ? parseInt(value, 10) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<Donor>('http://localhost:8000/donors/', formData);
      setDonors([...donors, response.data]);
      setShowForm(false);
      setFormData({ name: '', blood_type: 'A+', age: 30, location: '', organ: 'kidney', status: 'available' });
    } catch (error) {
      console.error('Error creating donor:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-medical-green text-white';
      case 'processing':
        return 'bg-medical-yellow text-black';
      case 'allocated':
        return 'bg-apple-blue text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-apple-gray">
      <Navbar />
      <div className="flex">
        <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold">Donor Management</h1>
            <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
              {showForm ? 'Cancel' : '+ Add Donor'}
            </Button>
          </div>

          {showForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Add New Donor</h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                      <select
                        name="blood_type"
                        value={formData.blood_type}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent"
                      >
                        {bloodTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organ</label>
                      <select
                        name="organ"
                        value={formData.organ}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent"
                      >
                        {organs.map(organ => (
                          <option key={organ} value={organ}>{organ.charAt(0).toUpperCase() + organ.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary">Save Donor</button>
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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donors.map((donor) => (
                      <motion.tr 
                        key={donor.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">{donor.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{donor.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{donor.blood_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{donor.age}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{donor.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{donor.organ.charAt(0).toUpperCase() + donor.organ.slice(1)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donor.status)}`}>
                            {donor.status.charAt(0).toUpperCase() + donor.status.slice(1)}
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

export default DonorManagement;
