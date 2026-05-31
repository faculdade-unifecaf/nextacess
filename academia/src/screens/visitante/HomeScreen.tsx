import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
  Animated, ScrollView, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock, CheckCircle, XCircle, RefreshCw, QrCode,
  Building2, FileText, Calendar, ChevronDown, Send,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useAccessResult } from '../../hooks/useAccessResult';
import AccessOverlay from '../../components/AccessOverlay';
import api from '../../../services/api';
import { C } from '../../../constants/theme';

/* ─── Token rotativo (funcionários / recepção) ─── */
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

interface Empresa { id: string; nome: string; andar: number; sala: string }

/* ─── Tela de solicitação ─── */
function SolicitarAcesso({ onSolicitado }: { onSolicitado: () => void }) {
  const { solicitarAcesso } = useAuth();
  const [empresas, setEmpresas]   = useState<Empresa[]>([]);
  const [empresaId, setEmpresaId] = useState('');
  const [motivo, setMotivo]       = useState('');
  const [data, setData]           = useState('');
  const [hora, setHora]           = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    api.get('/publico/empresas').then(r => setEmpresas(r.data)).catch(() => {});
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);
  const empresa = empresas.find(e => e.id === empresaId);

  const handleEnviar = async () => {
    if (!empresaId || !motivo || !data || !hora) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos para solicitar acesso.');
      return;
    }
    setLoading(true);
    try {
      await solicitarAcesso(empresaId, motivo, data, hora);
      onSolicitado();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Erro ao enviar solicitação.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.solicitarHeader}>
        <View style={s.solicitarIconWrap}>
          <QrCode color={C.blue} size={28} strokeWidth={2} />
        </View>
        <Text style={s.solicitarTitle}>Solicitar Acesso</Text>
        <Text style={s.solicitarDesc}>
          Escolha a empresa que deseja visitar e envie sua solicitação. Após a aprovação, seu QR Code será gerado automaticamente.
        </Text>
      </View>

      {/* Empresa */}
      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Empresa</Text>
        <TouchableOpacity style={s.pickerBtn} onPress={() => setShowPicker(v => !v)} activeOpacity={0.8}>
          <Building2 size={16} color={C.muted} />
          <Text style={[s.pickerText, !empresa && { color: C.muted }]}>
            {empresa ? `${empresa.nome} — ${empresa.andar}º andar, Sala ${empresa.sala}` : 'Selecione a empresa…'}
          </Text>
          <ChevronDown size={16} color={C.muted} />
        </TouchableOpacity>
        {showPicker && (
          <View style={s.dropdownList}>
            {empresas.map(e => (
              <TouchableOpacity
                key={e.id}
                style={[s.dropdownItem, e.id === empresaId && s.dropdownItemActive]}
                onPress={() => { setEmpresaId(e.id); setShowPicker(false); }}
              >
                <Text style={[s.dropdownText, e.id === empresaId && s.dropdownTextActive]}>
                  {e.nome}
                </Text>
                <Text style={s.dropdownSub}>{e.andar}º andar · Sala {e.sala}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Motivo */}
      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Motivo da visita</Text>
        <View style={s.inputWrap}>
          <FileText size={16} color={C.muted} />
          <TextInput
            style={s.input}
            value={motivo}
            onChangeText={setMotivo}
            placeholder="Ex: Reunião, entrevista…"
            placeholderTextColor={C.muted}
          />
        </View>
      </View>

      {/* Data e Hora */}
      <View style={s.rowFields}>
        <View style={[s.fieldGroup, { flex: 1 }]}>
          <Text style={s.fieldLabel}>Data da visita</Text>
          <View style={s.inputWrap}>
            <Calendar size={16} color={C.muted} />
            <TextInput
              style={s.input}
              value={data}
              onChangeText={setData}
              placeholder="AAAA-MM-DD"
              placeholderTextColor={C.muted}
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={[s.fieldGroup, { flex: 1 }]}>
          <Text style={s.fieldLabel}>Horário</Text>
          <View style={s.inputWrap}>
            <Clock size={16} color={C.muted} />
            <TextInput
              style={s.input}
              value={hora}
              onChangeText={setHora}
              placeholder="HH:MM"
              placeholderTextColor={C.muted}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Botão */}
      <TouchableOpacity style={[s.enviarBtn, loading && s.enviarBtnDisabled]} onPress={handleEnviar} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color="#fff" size="small" /> : <Send size={18} color="#fff" />}
        <Text style={s.enviarText}>{loading ? 'Enviando…' : 'Enviar Solicitação'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ─── Tela principal ─── */
export default function VisitanteHomeScreen() {
  const { user, refreshVisitanteStatus, solicitarAcesso } = useAuth();
  const accessResult = useAccessResult(user?.id);
  const [refreshing, setRefreshing] = useState(false);

  if (!user) return null;

  const status      = user.visitanteStatus;
  const isPublicForm = !!user.qr_token;
  const { token: rotatingToken, seconds } = useRotatingToken(user.id);
  const token       = isPublicForm ? user.qr_token! : rotatingToken;
  const progress    = seconds / 30;
  const timerColor  = seconds > 10 ? C.blue : seconds > 5 ? C.warning : C.danger;

  const animWidth = useRef(new Animated.Value(progress)).current;
  useEffect(() => {
    Animated.timing(animWidth, { toValue: progress, duration: 500, useNativeDriver: false }).start();
  }, [progress]);

  const doRefresh = async () => {
    setRefreshing(true);
    await refreshVisitanteStatus();
    setRefreshing(false);
  };

  /* Sem status ativo → tela de solicitação */
  const semAcesso = !status || status === 'Saiu' || status === 'Negado';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {accessResult && <AccessOverlay result={accessResult} />}

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Olá, {user.nome.split(' ')[0]}</Text>
          {semAcesso && <Text style={s.subtitle}>Solicite acesso para entrar</Text>}
        </View>
        <TouchableOpacity onPress={doRefresh} disabled={refreshing} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          {refreshing ? <ActivityIndicator color={C.blue} size="small" /> : <RefreshCw color={C.muted} size={18} />}
        </TouchableOpacity>
      </View>

      {/* Acesso negado — banner antes do form */}
      {status === 'Negado' && (
        <View style={s.negadoBanner}>
          <XCircle size={16} color={C.danger} />
          <Text style={s.negadoText}>Seu último acesso foi negado. Envie uma nova solicitação.</Text>
        </View>
      )}

      {/* ── Estado: sem acesso ativo ── */}
      {semAcesso && (
        <SolicitarAcesso onSolicitado={doRefresh} />
      )}

      {/* ── Estado: aguardando ── */}
      {status === 'Aguardando' && (
        <View style={s.content}>
          <View style={[s.statusCard, { borderColor: C.warning + '40', backgroundColor: C.warning + '0d' }]}>
            <View style={[s.iconWrap, { backgroundColor: C.warning + '18' }]}>
              <Clock color={C.warning} size={28} />
            </View>
            <Text style={[s.statusLabel, { color: C.warning }]}>Aguardando aprovação</Text>
            <Text style={s.statusDesc}>
              {user.visitaEmpresaNome
                ? `Sua solicitação foi enviada para ${user.visitaEmpresaNome}. Aguarde a resposta.`
                : 'Sua solicitação foi recebida. Aguarde a aprovação de um administrador.'}
            </Text>
          </View>
          <TouchableOpacity style={s.refreshBtn} onPress={doRefresh} disabled={refreshing}>
            <RefreshCw color={C.blue} size={16} />
            <Text style={s.refreshText}>Verificar status</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Estado: aprovado / em visita ── */}
      {(status === 'Aprovado' || status === 'Em visita') && (
        <View style={s.content}>
          <View style={[s.statusCard, { borderColor: C.success + '40', backgroundColor: C.success + '0d' }]}>
            <View style={[s.iconWrap, { backgroundColor: C.success + '18' }]}>
              <CheckCircle color={C.success} size={28} />
            </View>
            <Text style={[s.statusLabel, { color: C.success }]}>
              {status === 'Em visita' ? 'Em visita' : 'Acesso aprovado'}
            </Text>
            <Text style={s.statusDesc}>Apresente o QR Code abaixo na catraca de entrada.</Text>
          </View>

          <View style={s.qrCard}>
            <LinearGradient colors={['rgba(76,158,255,0.14)', 'rgba(76,158,255,0.0)']} style={s.cardGlow} />
            <View style={s.qrLabelRow}>
              <View style={s.qrLabelIcon}><QrCode color={C.blue} size={14} /></View>
              <Text style={s.qrLabel}>QR Code de Acesso</Text>
            </View>
            <View style={s.qrWrap}>
              {token
                ? <QRCode value={token} size={220} color="#000000" backgroundColor="#ffffff" />
                : <ActivityIndicator color={C.blue} />}
            </View>
            {!isPublicForm && (
              <View style={s.timerSection}>
                <View style={s.timerHeader}>
                  <Text style={s.timerLabel}>Renova em</Text>
                  <Text style={[s.timerCount, { color: timerColor }]}>{seconds}s</Text>
                </View>
                <View style={s.timerTrack}>
                  <Animated.View style={[s.timerFill, {
                    width: animWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    backgroundColor: timerColor,
                  }]} />
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: C.bg },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  title:              { color: C.text, fontSize: 22, fontWeight: '800' },
  subtitle:           { color: C.muted, fontSize: 13, marginTop: 2 },
  content:            { flex: 1, padding: 20, gap: 16 },

  negadoBanner:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 4, backgroundColor: C.danger + '12', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.danger + '30' },
  negadoText:         { color: C.danger, fontSize: 12, flex: 1, lineHeight: 18 },

  /* Solicitar */
  scroll:             { flex: 1 },
  scrollContent:      { padding: 20, gap: 16, paddingBottom: 40 },
  solicitarHeader:    { alignItems: 'center', gap: 10, marginBottom: 8 },
  solicitarIconWrap:  { width: 64, height: 64, borderRadius: 20, backgroundColor: C.blueD, alignItems: 'center', justifyContent: 'center' },
  solicitarTitle:     { color: C.text, fontSize: 20, fontWeight: '800' },
  solicitarDesc:      { color: C.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  fieldGroup:         { gap: 6 },
  fieldLabel:         { color: C.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  inputWrap:          { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12 },
  input:              { flex: 1, color: C.text, fontSize: 14 },
  rowFields:          { flexDirection: 'row', gap: 12 },

  pickerBtn:          { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12 },
  pickerText:         { flex: 1, color: C.text, fontSize: 14 },
  dropdownList:       { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  dropdownItem:       { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  dropdownItemActive: { backgroundColor: C.blueD },
  dropdownText:       { color: C.text, fontSize: 14, fontWeight: '600' },
  dropdownTextActive: { color: C.blue },
  dropdownSub:        { color: C.muted, fontSize: 11, marginTop: 2 },

  enviarBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.blue, borderRadius: 14, paddingVertical: 16, marginTop: 8 },
  enviarBtnDisabled:  { opacity: 0.6 },
  enviarText:         { color: '#fff', fontSize: 16, fontWeight: '700' },

  /* Status cards */
  statusCard:         { borderRadius: 20, padding: 24, borderWidth: 1, alignItems: 'center', gap: 10 },
  iconWrap:           { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statusLabel:        { fontSize: 18, fontWeight: '800' },
  statusDesc:         { color: C.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  /* QR */
  qrCard:             { backgroundColor: C.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border, alignItems: 'center', gap: 20, overflow: 'hidden' },
  cardGlow:           { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  qrLabelRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qrLabelIcon:        { width: 26, height: 26, borderRadius: 8, backgroundColor: C.blueD, alignItems: 'center', justifyContent: 'center' },
  qrLabel:            { color: C.text, fontSize: 15, fontWeight: '700' },
  qrWrap:             { padding: 14, backgroundColor: '#ffffff', borderRadius: 16 },
  timerSection:       { width: '100%', gap: 8 },
  timerHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timerLabel:         { color: C.muted, fontSize: 12, fontWeight: '600' },
  timerCount:         { fontSize: 14, fontWeight: '800' },
  timerTrack:         { height: 8, backgroundColor: C.border, borderRadius: 8, overflow: 'hidden', width: '100%' },
  timerFill:          { height: '100%', borderRadius: 8 },
  refreshBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.blueD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(76,158,255,0.2)' },
  refreshText:        { color: C.blue, fontWeight: '700', fontSize: 14 },
});
