import api from './api';
import type { Aviso } from '../data/mockData';

export const avisosService = {
  async getAll(): Promise<Aviso[]> {
    const response = await api.get('/avisos');
    return response.data;
  },

  async getById(id: string): Promise<Aviso> {
    const response = await api.get(`/avisos/${id}`);
    return response.data;
  },

  async create(data: Omit<Aviso, 'id' | 'data_criacao'>): Promise<Aviso> {
    const response = await api.post('/avisos', data);
    return response.data;
  },

  async update(id: string, data: Partial<Aviso>): Promise<Aviso> {
    const response = await api.put(`/avisos/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/avisos/${id}`);
  },
};
