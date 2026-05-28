import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { Briefcase, QrCode, MapPin, Zap } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useAccessResult } from '../../hooks/useAccessResult';
import AccessOverlay from '../../components/AccessOverlay';
import { C } from '../../../constants/theme';

function useRotatingToken(userId: string) {
  const [token, setToken]     = useState('');
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const update = () => {
      const now  = Date.now();
      const slot = Math.floor(now / 30000);
      const rem  = 30 - Math.floor((now % 30000) / 1000);
      setToken(`NEXTACCESS:${userId}:${slot}`);
      setSeconds(rem);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [userId]);

  return { token, seconds };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function FuncHomeScreen() {
  const { user }     = useAuth();
  const accessResult = useAccessResult(user?.id);
  if (!user) return null;

  const { token, seconds } = useRotatingToken(user.id);
  const progress   = seconds / 30;
  const timerColor = seconds > 10 ? C.blue : seconds > 5 ? C.warning : C.danger;

  const animWidth = useRef(new Animated.Value(progress)).current;
  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {accessResult && <AccessOverlay result={accessResult} />}

      <View style={s.header}>
        <View>
          <Text style={s.greetSmall}>{getGreeting()},</Text>
          <Text style={s.greetName}>{user.nome.split(' ')[0]}</Text>
        </View>
        <View style={s.rolePill}>
          <Briefcase color={C.blue} size={13} />
          <Text style={s.rolePillText}>Funcionário</Text>
        </View>
      </View>

      <View style={s.content}>
        <View style={s.qrCard}>
          <LinearGradient
            colors={['rgba(76,158,255,0.14)', 'rgba(76,158,255,0.0)']}
            style={s.cardGlow}
          />
          <View style={s.qrLabelRow}>
            <View style={s.qrLabelIcon}>
              <QrCode color={C.blue} size={14} />
            </View>
            <Text style={s.qrLabel}>QR Code de Acesso</Text>
          </View>

          <View style={s.qrWrap}>
            {token
              ? <QRCode value={token} size={220} color="#000000" backgroundColor="#ffffff" />
              : <ActivityIndicator color={C.blue} size="large" style={{ width: 220, height: 220 }} />}
          </View>

          <View style={s.timerSection}>
            <View style={s.timerHeader}>
              <Text style={s.timerLabel}>Renova em</Text>
              <Text style={[s.timerCount, { color: timerColor }]}>{seconds}s</Text>
            </View>
            <View style={s.timerTrack}>
              <Animated.View style={[
                s.timerFill,
                {
                  width: animWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  backgroundColor: timerColor,
                },
              ]} />
            </View>
            <Text style={s.qrHint}>Apresente na catraca para liberar o acesso</Text>
          </View>
        </View>

        <View style={s.infoStrip}>
          <View style={s.infoItem}>
            <MapPin color={C.muted} size={13} />
            <Text style={s.infoLabel}>Local</Text>
            <Text style={s.infoValue}>Catraca Principal</Text>
          </View>
          <View style={s.infoDivider} />
          <View style={s.infoItem}>
            <Briefcase color={C.muted} size={13} />
            <Text style={s.infoLabel}>Perfil</Text>
            <Text style={s.infoValue}>Funcionário</Text>
          </View>
          <View style={s.infoDivider} />
          <View style={s.infoItem}>
            <Zap color={C.success} size={13} />
            <Text style={s.infoLabel}>Status</Text>
            <Text style={[s.infoValue, { color: C.success }]}>Ativo</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  greetSmall:   { color: C.muted, fontSize: 14, fontWeight: '500' },
  greetName:    { color: C.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  rolePill:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.blueD, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(76,158,255,0.25)' },
  rolePillText: { color: C.blue, fontSize: 12, fontWeight: '700' },

  content:      { flex: 1, paddingHorizontal: 20, paddingTop: 12, gap: 14 },

  qrCard:       { backgroundColor: C.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border, alignItems: 'center', gap: 20, overflow: 'hidden' },
  cardGlow:     { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  qrLabelRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qrLabelIcon:  { width: 26, height: 26, borderRadius: 8, backgroundColor: C.blueD, alignItems: 'center', justifyContent: 'center' },
  qrLabel:      { color: C.text, fontSize: 15, fontWeight: '700' },
  qrWrap:       { padding: 14, backgroundColor: '#ffffff', borderRadius: 16 },

  timerSection: { width: '100%', gap: 8 },
  timerHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timerLabel:   { color: C.muted, fontSize: 12, fontWeight: '600' },
  timerCount:   { fontSize: 14, fontWeight: '800' },
  timerTrack:   { height: 8, backgroundColor: C.border, borderRadius: 8, overflow: 'hidden', width: '100%' },
  timerFill:    { height: '100%', borderRadius: 8 },
  qrHint:       { color: C.muted, fontSize: 11, textAlign: 'center', lineHeight: 16 },

  infoStrip:    { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.border },
  infoItem:     { flex: 1, alignItems: 'center', gap: 4 },
  infoLabel:    { color: C.muted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  infoValue:    { color: C.text, fontSize: 13, fontWeight: '700' },
  infoDivider:  { width: 1, backgroundColor: C.border, marginVertical: 4 },
});
