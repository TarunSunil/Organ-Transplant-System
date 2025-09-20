import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Donor endpoints
export const donorService = {
  getAll: async () => {
    const response = await api.get('/donors');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/donors/${id}`);
    return response.data;
  },
  create: async (donorData: any) => {
    const response = await api.post('/donors', donorData);
    return response.data;
  },
  update: async (id: number, donorData: any) => {
    const response = await api.put(`/donors/${id}`, donorData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/donors/${id}`);
    return response.data;
  },
};

// Recipient endpoints
export const recipientService = {
  getAll: async () => {
    const response = await api.get('/recipients');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/recipients/${id}`);
    return response.data;
  },
  create: async (recipientData: any) => {
    const response = await api.post('/recipients', recipientData);
    return response.data;
  },
  update: async (id: number, recipientData: any) => {
    const response = await api.put(`/recipients/${id}`, recipientData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/recipients/${id}`);
    return response.data;
  },
};

// Matching endpoints
export const matchService = {
  getAiMatch: async (donorId: number, recipientId: number) => {
    const response = await api.post(`/ai-match?donor_id=${donorId}&recipient_id=${recipientId}`);
    return response.data;
  },
  findMatches: async (donorId: number) => {
    const response = await api.get(`/match/${donorId}`);
    return response.data;
  },
  allocateOrgan: async (donorId: number, recipientId: number) => {
    const response = await api.post(`/match/allocate`, { donor_id: donorId, recipient_id: recipientId });
    return response.data;
  },
};

// Logs endpoints
export const logService = {
  getAllLogs: async () => {
    const response = await api.get('/logs');
    return response.data;
  },
};

export default {
  donorService,
  recipientService,
  matchService,
  logService,
};