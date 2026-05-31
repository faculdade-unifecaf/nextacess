import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import api, { setAuthToken, clearAuthToken } from '../../services/api';
import { registerForPush, unregisterPush } from '../services/push';

export type Role = 'admin' | 'funcionario' | 'visitante';

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  role: Role;
  empresa_id?: string;
  avatar_color?: string;
  visitanteStatus?: string | null;
  qr_token?: string | null;
  visitaEmpresaNome?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, cpf: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshVisitanteStatus: () => Promise<void>;
  solicitarAcesso: (empresaId: string, motivo: string, dataVisita: string, horaPrevista: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['token', 'user']).then((pairs) => {
      const tokenVal = pairs[0]?.[1];
      const userVal  = pairs[1]?.[1];
      if (tokenVal) setAuthToken(tokenVal);
      if (userVal) {
        setUser(JSON.parse(userVal));
        registerForPush().catch(() => {});
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('auth:logout', () => setUser(null));
    return () => sub.remove();
  }, []);

  const login = async (email: string, cpf: string) => {
    const { data } = await api.post('/auth/app-login', { email, cpf });
    setAuthToken(data.token);
    await AsyncStorage.multiSet([['token', data.token], ['user', JSON.stringify(data.user)]]);
    setUser(data.user);
    registerForPush().catch(() => {});
  };

  const logout = async () => {
    clearAuthToken();
    await unregisterPush();
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  };

  const refreshVisitanteStatus = async () => {
    if (!user || user.role !== 'visitante') return;
    const { data } = await api.get('/visitantes/meu-status');
    const updated = {
      ...user,
      id:                data.id        ?? user.id,
      visitanteStatus:   data.status    ?? null,
      qr_token:          data.qr_token  ?? null,
      visitaEmpresaNome: data.empresa_nome ?? null,
    };
    await AsyncStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const solicitarAcesso = async (empresaId: string, motivo: string, dataVisita: string, horaPrevista: string) => {
    if (!user || user.role !== 'visitante') return;
    const { data } = await api.post('/visitantes/solicitar', {
      empresa_id: empresaId, motivo, data_visita: dataVisita, hora_prevista: horaPrevista,
    });
    const updated = {
      ...user,
      id:                data.id,
      visitanteStatus:   'Aguardando',
      qr_token:          null,
      visitaEmpresaNome: undefined,
    };
    await AsyncStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshVisitanteStatus, solicitarAcesso }}>
      {children}
    </AuthContext.Provider>
  );
}
