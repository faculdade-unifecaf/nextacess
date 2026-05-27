import api from './api';

export interface Mensagem {
  id: string;
  empresa_id: string;
  from_role: string;
  texto: string;
  created_at: string;
}

export const chatService = {
  async getMensagens(empresaId: string): Promise<Mensagem[]> {
    const { data } = await api.get(`/chat/${empresaId}`);
    return data;
  },

  async sendMensagem(empresaId: string, texto: string): Promise<Mensagem> {
    const { data } = await api.post(`/chat/${empresaId}`, { from_role: 'recepcionista', texto });
    return data;
  },
};
