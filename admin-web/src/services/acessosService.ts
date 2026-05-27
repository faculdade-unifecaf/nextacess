import api from './api';
import type { Acesso } from '../data/mockData';

export const acessosService = {
  async getAll(): Promise<Acesso[]> {
    const response = await api.get('/acessos');
    return response.data;
  },

  async getById(id: string): Promise<Acesso> {
    const response = await api.get(`/acessos/${id}`);
    return response.data;
  },

  async create(data: Omit<Acesso, 'id'>): Promise<Acesso> {
    const response = await api.post('/acessos', data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/acessos/${id}`);
  },
};
