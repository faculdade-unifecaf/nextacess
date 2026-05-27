import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export type Role = 'admin' | 'funcionario' | 'visitante';

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: Role;
  empresa_id?: string;
  avatar_color?: string;
  visitanteStatus?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, cpf: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshVisitanteStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['token', 'user']).then((pairs) => {
      const userVal = pairs[1]?.[1];
      if (userVal) setUser(JSON.parse(userVal));
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, cpf: string) => {
    const { data } = await api.post('/auth/app-login', { email, cpf });
    await AsyncStorage.multiSet([['token', data.token], ['user', JSON.stringify(data.user)]]);
    setUser(data.user);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  };

  const refreshVisitanteStatus = async () => {
    if (!user || user.role !== 'visitante') return;
    const { data } = await api.get(`/visitantes/${user.id}`);
    const updated = { ...user, visitanteStatus: data.status };
    await AsyncStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshVisitanteStatus }}>
      {children}
    </AuthContext.Provider>
  );
}
