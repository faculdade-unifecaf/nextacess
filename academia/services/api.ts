import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

// Token em memória — elimina leitura de AsyncStorage em cada requisição
let _token: string | null = null;

export const setAuthToken  = (t: string | null) => { _token = t; };
export const clearAuthToken = () => { _token = null; };


const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      _token = null;
      await AsyncStorage.multiRemove(['token', 'user']);
      DeviceEventEmitter.emit('auth:logout');
    }
    return Promise.reject(error);
  }
);

export default api;
