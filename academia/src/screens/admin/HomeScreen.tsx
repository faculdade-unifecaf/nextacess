import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Shield } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useAccessResult } from '../../hooks/useAccessResult';
import AccessOverlay from '../../components/AccessOverlay';
import { C } from '../../../constants/theme';

function useRotatingToken(userId: string) {
  const [token, setToken]     = useState('');
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const update = () => {
      const now   = Date.now();
      const slot  = Math.floor(now / 30000);
      const rem   = 30 - Math.floor((now % 30000) / 1000);
      setToken(`NEXTACCESS:${userId}:${slot}`);
      setSeconds(rem);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [userId]);

  return { token, seconds };
}

export default function AdminHomeScreen() {
  const { user }   = useAuth();
  const accessResult = useAccessResult(user?.id);
  if (!user) return null;

  const { token, seconds } = useRotatingToken(user.id);
  const progress = seconds / 30;
  const color    = seconds > 10 ? C.blue : C.danger;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {accessResult && <AccessOverlay result={accessResult} />}
      <View style={s.header}>
        <Shield color={C.warning} size={20} />
        <Text style={s.title}>Acesso</Text>
      </View>

      <View style={s.content}>
        <View style={s.greeting}>
          <Text style={s.greetLabel}>Olá,</Text>
          <Text style={s.greetName}>{user.nome.split(' ')[0]}</Text>
        </View>

        <View style={s.qrCard}>
          <Text style={s.qrLabel}>QR Code de Acesso</Text>
          <View style={s.qrWrap}>
            {token ? <QRCode value={token} size={240} color="#000000" backgroundColor="#ffffff" /> : <ActivityIndicator color={C.blue} />}
          </View>
          <View style={s.timerRow}>
            <View style={[s.timerBar, { width: '100%' }]}>
              <View style={[s.timerFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
            </View>
            <Text style={[s.timerText, { color }]}>Renova em {seconds}s</Text>
          </View>
          <Text style={s.qrHint}>Apresente este código na catraca para liberar o acesso</Text>
        </View>

        <View style={s.roleCard}>
          <Shield color={C.warning} size={16} />
          <Text style={s.roleText}>Administrador · Acesso completo ao andar</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  header:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, paddingBottom: 4 },
  title:     { color: C.text, fontSize: 22, fontWeight: '800' },
  content:   { flex: 1, padding: 20, gap: 16 },
  greeting:  { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  greetLabel:{ color: C.muted, fontSize: 18 },
  greetName: { color: C.text, fontSize: 24, fontWeight: '800' },
  qrCard:    { backgroundColor: C.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: C.border, alignItems: 'center', gap: 16 },
  qrLabel:   { color: C.muted, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  qrWrap:    { padding: 16, backgroundColor: C.surface, borderRadius: 12 },
  timerRow:  { width: '100%', gap: 6, alignItems: 'center' },
  timerBar:  { height: 4, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 4 },
  timerText: { fontSize: 12, fontWeight: '600' },
  qrHint:    { color: C.muted, fontSize: 11, textAlign: 'center' },
  roleCard:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  roleText:  { color: C.warning, fontSize: 13, fontWeight: '600' },
});
