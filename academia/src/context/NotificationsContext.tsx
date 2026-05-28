import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { useAuth } from './AuthContext';

interface NotificationsContextType {
  visitantesAguardando: number;
  chatNaoLido: boolean;
  avisosNaoLido: boolean;
  markChatRead: () => Promise<void>;
  markAvisosRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  visitantesAguardando: 0,
  chatNaoLido: false,
  avisosNaoLido: false,
  markChatRead: async () => {},
  markAvisosRead: async () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [visitantesAguardando, setVisitantesAguardando] = useState(0);
  const [chatNaoLido,          setChatNaoLido]          = useState(false);
  const [avisosNaoLido,        setAvisosNaoLido]        = useState(false);

  // Refs para timestamps de última leitura (evita re-render desnecessário)
  const chatLastReadRef   = useRef<string | null>(null);
  const avisosLastReadRef = useRef<string | null>(null);

  // Carrega timestamps persistidos ao logar
  useEffect(() => {
    if (!user) {
      setVisitantesAguardando(0);
      setChatNaoLido(false);
      setAvisosNaoLido(false);
      return;
    }
    const chatKey   = `@nextaccess:chat_last_read_${user.empresa_id ?? user.id}`;
    const avisosKey = `@nextaccess:avisos_last_read_${user.id}`;
    AsyncStorage.multiGet([chatKey, avisosKey]).then(pairs => {
      chatLastReadRef.current   = pairs[0][1];
      avisosLastReadRef.current = pairs[1][1];
    });
  }, [user?.id]);

  // --- Polling: visitantes aguardando (admin) ---
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const poll = async () => {
      try {
        const { data } = await api.get('/visitantes');
        const count = (data as any[]).filter(v => v.status === 'Aguardando').length;
        setVisitantesAguardando(count);
      } catch {}
    };
    poll();
    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, [user?.id]);

  // --- Polling: chat não lido (admin com empresa) ---
  useEffect(() => {
    if (!user || user.role !== 'admin' || !user.empresa_id) return;
    const poll = async () => {
      try {
        const { data } = await api.get(`/chat/${user.empresa_id}`);
        const msgs = (data as any[]).filter(m => m.from_role === 'recepcionista');
        if (!msgs.length) return;
        const latest = msgs[msgs.length - 1].created_at as string;
        const lastRead = chatLastReadRef.current;
        if (!lastRead || new Date(latest) > new Date(lastRead)) {
          setChatNaoLido(true);
        }
      } catch {}
    };
    poll();
    const id = setInterval(poll, 6000);
    return () => clearInterval(id);
  }, [user?.id, user?.empresa_id]);

  // --- Polling: avisos não lidos (admin + funcionário) ---
  useEffect(() => {
    if (!user || user.role === 'visitante') return;
    const poll = async () => {
      try {
        const { data } = await api.get('/avisos');
        const lastRead = avisosLastReadRef.current;
        if (!lastRead) {
          if ((data as any[]).length > 0) setAvisosNaoLido(true);
          return;
        }
        const hasNew = (data as any[]).some(a => new Date(a.created_at) > new Date(lastRead));
        if (hasNew) setAvisosNaoLido(true);
      } catch {}
    };
    poll();
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, [user?.id]);

  const markChatRead = useCallback(async () => {
    const now = new Date().toISOString();
    chatLastReadRef.current = now;
    setChatNaoLido(false);
    if (!user) return;
    const key = `@nextaccess:chat_last_read_${user.empresa_id ?? user.id}`;
    await AsyncStorage.setItem(key, now).catch(() => {});
  }, [user?.id]);

  const markAvisosRead = useCallback(async () => {
    const now = new Date().toISOString();
    avisosLastReadRef.current = now;
    setAvisosNaoLido(false);
    if (!user) return;
    const key = `@nextaccess:avisos_last_read_${user.id}`;
    await AsyncStorage.setItem(key, now).catch(() => {});
  }, [user?.id]);

  return (
    <NotificationsContext.Provider value={{
      visitantesAguardando,
      chatNaoLido,
      avisosNaoLido,
      markChatRead,
      markAvisosRead,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}
