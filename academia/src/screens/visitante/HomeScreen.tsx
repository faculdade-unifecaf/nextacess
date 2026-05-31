import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, CheckCircle, XCircle, RefreshCw, QrCode } from 'lucide-react-native';
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

export default function VisitanteHomeScreen() {
  const { user, refreshVisitanteStatus } = useAuth();
  const accessResult = useAccessResult(user?.id);
  const [refreshing, setRefreshing]      = useState(false);

  if (!user) return null;

  const status  = user.visitanteStatus ?? 'Aguardando';

  // Visitantes do formulário público têm qr_token UUID fixo
  // Visitantes cadastrados pela recepção usam token rotativo
  const isPublicForm = !!user.qr_token;
  const { token: rotatingToken, seconds } = useRotatingToken(user.id);
  const token    = isPublicForm ? user.qr_token! : rotatingToken;
  const progress = seconds / 30;
  const timerColor = seconds > 10 ? C.blue : seconds > 5 ? C.warning : C.danger;

  const animWidth = useRef(new Animated.Value(progress)).current;
  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const doRefresh = async () => {
    setRefreshing(true);
    await refreshVisitanteStatus();
    setRefreshing(false);
  };

  const STATUS_MAP: Record<string, { icon: any; color: string; label: string; desc: string }> = {
    'Aguardando': { icon: Clock,        color: C.warning, label: 'Aguardando aprovação', desc: 'Sua solicitação foi recebida pela recepção. Aguarde a aprovação de um administrador.' },
    'Negado':     { icon: XCircle,      color: C.danger,  label: 'Acesso negado',       desc: 'Seu acesso foi negado. Entre em contato com a recepção.' },
    'Aprovado':   { icon: CheckCircle,  color: C.success, label: 'Acesso aprovado',      desc: 'Apresente o QR Code abaixo na catraca para liberar o acesso.' },
    'Em visita':  { icon: CheckCircle,  color: C.blue,    label: 'Em visita',            desc: 'Apresente o QR Code abaixo na catraca para liberar o acesso.' },
  };

  const info = STATUS_MAP[status] ?? STATUS_MAP['Aguardando'];
  const Icon = info.icon;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {accessResult && <AccessOverlay result={accessResult} />}
      <View style={s.header}>
        <Text style={s.title}>Olá, {user.nome.split(' ')[0]}</Text>
        <TouchableOpacity onPress={doRefresh} disabled={refreshing}>
          {refreshing ? <ActivityIndicator color={C.blue} size="small" /> : <RefreshCw color={C.muted} size={18} />}
        </TouchableOpacity>
      </View>

      <View style={s.content}>
        <View style={[s.statusCard, { borderColor: info.color + '40', backgroundColor: info.color + '0d' }]}>
          <View style={[s.iconWrap, { backgroundColor: info.color + '18' }]}>
            <Icon color={info.color} size={28} />
          </View>
          <Text style={[s.statusLabel, { color: info.color }]}>{info.label}</Text>
          <Text style={s.statusDesc}>{info.desc}</Text>
        </View>

        {(status === 'Aprovado' || status === 'Em visita') && (
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
              {token ? <QRCode value={token} size={220} color="#000000" backgroundColor="#ffffff" /> : <ActivityIndicator color={C.blue} />}
            </View>
            {!isPublicForm && (
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
              </View>
            )}
          </View>
        )}

        {status === 'Aguardando' && (
          <TouchableOpacity style={s.refreshBtn} onPress={doRefresh} disabled={refreshing}>
            <RefreshCw color={C.blue} size={16} />
            <Text style={s.refreshText}>Verificar status</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.bg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  title:       { color: C.text, fontSize: 22, fontWeight: '800' },
  content:     { flex: 1, padding: 20, gap: 16 },
  statusCard:  { borderRadius: 20, padding: 24, borderWidth: 1, alignItems: 'center', gap: 10 },
  iconWrap:    { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statusLabel: { fontSize: 18, fontWeight: '800' },
  statusDesc:  { color: C.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  qrCard:      { backgroundColor: C.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border, alignItems: 'center', gap: 20, overflow: 'hidden' },
  cardGlow:    { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  qrLabelRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qrLabelIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: C.blueD, alignItems: 'center', justifyContent: 'center' },
  qrLabel:     { color: C.text, fontSize: 15, fontWeight: '700' },
  qrWrap:      { padding: 14, backgroundColor: '#ffffff', borderRadius: 16 },
  timerSection:{ width: '100%', gap: 8 },
  timerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timerLabel:  { color: C.muted, fontSize: 12, fontWeight: '600' },
  timerCount:  { fontSize: 14, fontWeight: '800' },
  timerTrack:  { height: 8, backgroundColor: C.border, borderRadius: 8, overflow: 'hidden', width: '100%' },
  timerFill:   { height: '100%', borderRadius: 8 },
  refreshBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.blueD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(76,158,255,0.2)' },
  refreshText: { color: C.blue, fontWeight: '700', fontSize: 14 },
});
