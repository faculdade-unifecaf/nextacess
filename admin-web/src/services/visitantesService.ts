import api from './api';
import type { Visitante } from '../data/mockData';

export const visitantesService = {
  async getAll(): Promise<Visitante[]> {
    const response = await api.get('/visitantes');
    return response.data;
  },

  async getById(id: string): Promise<Visitante> {
    const response = await api.get(`/visitantes/${id}`);
    return response.data;
  },

  async create(data: Omit<Visitante, 'id' | 'data_cadastro'>): Promise<Visitante> {
    const response = await api.post('/visitantes', data);
    return response.data;
  },

  async update(id: string, data: Partial<Visitante>): Promise<Visitante> {
    const response = await api.put(`/visitantes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/visitantes/${id}`);
  },

  async approve(id: string, autorizado_por: string): Promise<Visitante> {
    const response = await api.patch(`/visitantes/${id}/aprovar`, { autorizado_por });
    return response.data;
  },

  async deny(id: string): Promise<Visitante> {
    const response = await api.patch(`/visitantes/${id}/negar`);
    return response.data;
  },
};
