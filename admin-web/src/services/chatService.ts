import api from './api';

export interface Mensagem {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  conteudo: string;
  data_hora: string;
}

export const chatService = {
  async getMessages(limit: number = 50): Promise<Mensagem[]> {
    const response = await api.get('/chat/messages', { params: { limit } });
    return response.data;
  },

  async sendMessage(conteudo: string): Promise<Mensagem> {
    const response = await api.post('/chat/messages', { conteudo });
    return response.data;
  },

  async deleteMessage(id: string): Promise<void> {
    await api.delete(`/chat/messages/${id}`);
  },
};
