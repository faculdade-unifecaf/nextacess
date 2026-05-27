import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

export type AccessResult = {
  autorizado: boolean;
  nome?: string;
  tipo?: string;
  empresa?: string;
  motivo?: string;
};

export function useAccessResult(userId: string | undefined) {
  const [result, setResult] = useState<AccessResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/iot/acesso/${userId}`);
        if (data.novo) {
          setResult(data);
          // limpa após 4s
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setResult(null), 4000);
        }
      } catch {}
    }, 2000);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userId]);

  return result;
}
