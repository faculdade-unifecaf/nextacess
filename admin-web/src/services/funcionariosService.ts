import api from './api';
import type { Funcionario } from '../data/mockData';

export const funcionariosService = {
  async getAll(): Promise<Funcionario[]> {
    const response = await api.get('/funcionarios');
    return response.data;
  },

  async getById(id: string): Promise<Funcionario> {
    const response = await api.get(`/funcionarios/${id}`);
    return response.data;
  },

  async create(data: Omit<Funcionario, 'id' | 'avatarColor'>): Promise<Funcionario> {
    const response = await api.post('/funcionarios', data);
    return response.data;
  },

  async update(id: string, data: Partial<Funcionario>): Promise<Funcionario> {
    const response = await api.put(`/funcionarios/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/funcionarios/${id}`);
  },

  async updateStatus(id: string, status: Funcionario['status']): Promise<Funcionario> {
    const response = await api.patch(`/funcionarios/${id}/status`, { status });
    return response.data;
  },
};
