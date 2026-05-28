import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageSquare, Send, Wifi } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../../services/api';
import { C } from '../../../constants/theme';

type Msg = { id: string; from_role: string; texto: string; created_at: string };

// ── Animated typing dots ──────────────────────────────────────────────────────
function TypingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    dots.forEach((dot, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 140),
          Animated.timing(dot, { toValue: -5, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0,  duration: 280, useNativeDriver: true }),
          Animated.delay(560),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={td.bubble}>
      <View style={td.row}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[td.dot, { transform: [{ translateY: dot }] }]} />
        ))}
      </View>
    </View>
  );
}

const td = StyleSheet.create({
  bubble: { alignSelf: 'flex-start', backgroundColor: C.surface, borderRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: C.border, padding: 12, paddingHorizontal: 14 },
  row:    { flexDirection: 'row', alignItems: 'center', gap: 4, height: 14 },
  dot:    { width: 7, height: 7, borderRadius: 4, backgroundColor: C.muted },
});

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const { user }              = useAuth();
  const [msgs, setMsgs]       = useState<Msg[]>([]);
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro]       = useState<string | null>(null);
  const [typing, setTyping]   = useState(false);
  const flatRef               = useRef<FlatList>(null);
  const sendScale             = useRef(new Animated.Value(1)).current;

  const empresaId = user?.empresa_id;

  const load = useCallback(async () => {
    if (!empresaId) { setLoading(false); return; }
    try {
      const { data } = await api.get(`/chat/${empresaId}`);
      setMsgs(data);
      setErro(null);
    } catch (e: any) {
      setErro(e?.response?.data?.error ?? e?.message ?? 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (msgs.length) flatRef.current?.scrollToEnd({ animated: true });
  }, [msgs]);

  const animateSend = () => {
    Animated.sequence([
      Animated.timing(sendScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(sendScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const send = async () => {
    const t = text.trim();
    if (!t || !empresaId) return;
    setText('');
    animateSend();

    const tempMsg: Msg = {
      id: `temp-${Date.now()}`,
      from_role: user?.role ?? 'admin',
      texto: t,
      created_at: new Date().toISOString(),
    };
    setMsgs(prev => [...prev, tempMsg]);

    // show typing indicator for 2s to simulate reply
    setTyping(true);
    setTimeout(() => setTyping(false), 2200);

    try {
      await api.post(`/chat/${empresaId}`, { from_role: user?.role, texto: t });
      await load();
    } catch (e: any) {
      setMsgs(prev => prev.filter(m => m.id !== tempMsg.id));
      setText(t);
      setTyping(false);
      Alert.alert('Erro ao enviar', e?.response?.data?.error ?? e?.message ?? 'Falha ao enviar mensagem');
    }
  };

  if (!empresaId) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.center}>
        <MessageSquare color={C.muted} size={40} />
        <Text style={[s.empty, { marginTop: 12 }]}>Você não está associado a uma empresa</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerIcon}>
          <MessageSquare color={C.blue} size={17} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Suporte</Text>
          <View style={s.onlineRow}>
            <View style={s.onlineDot} />
            <Text style={s.subtitle}>Recepção • online</Text>
          </View>
        </View>
        <Wifi color={C.muted} size={16} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <View style={s.center}><ActivityIndicator color={C.blue} size="large" /></View>
        ) : erro ? (
          <View style={s.center}>
            <Text style={[s.empty, { color: C.danger, paddingHorizontal: 24, textAlign: 'center' }]}>{erro}</Text>
            <TouchableOpacity onPress={load} style={{ marginTop: 14, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: C.blueD, borderRadius: 12 }}>
              <Text style={{ color: C.blue, fontSize: 13, fontWeight: '700' }}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={msgs}
            keyExtractor={i => i.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 8, gap: 6 }}
            ListEmptyComponent={
              <View style={s.emptyWrap}>
                <View style={s.emptyIcon}>
                  <MessageSquare color={C.muted} size={32} />
                </View>
                <Text style={s.emptyTitle}>Nenhuma mensagem ainda</Text>
                <Text style={s.empty}>Inicie a conversa com a recepção</Text>
              </View>
            }
            ListFooterComponent={typing ? <View style={{ marginTop: 6 }}><TypingDots /></View> : null}
            renderItem={({ item, index }) => {
              const mine = item.from_role === user?.role;
              const hora = new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

              // date separator
              const thisDate = new Date(item.created_at).toLocaleDateString('pt-BR');
              const prevDate = index > 0 ? new Date(msgs[index - 1].created_at).toLocaleDateString('pt-BR') : null;
              const showDate = thisDate !== prevDate;

              return (
                <>
                  {showDate && (
                    <View style={s.dateSep}>
                      <View style={s.dateLine} />
                      <Text style={s.dateText}>{thisDate}</Text>
                      <View style={s.dateLine} />
                    </View>
                  )}
                  <View style={[s.bubbleWrap, mine ? s.wrapMine : s.wrapOther]}>
                    {mine ? (
                      <LinearGradient
                        colors={['#4c9eff', '#1e7ad1']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={[s.bubble, s.bubbleMine]}
                      >
                        <Text style={s.bubbleTextMine}>{item.texto}</Text>
                        <Text style={s.bubbleTimeMine}>{hora}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[s.bubble, s.bubbleOther]}>
                        <Text style={s.bubbleRole}>Recepção</Text>
                        <Text style={s.bubbleTextOther}>{item.texto}</Text>
                        <Text style={s.bubbleTimeOther}>{hora}</Text>
                      </View>
                    )}
                  </View>
                </>
              );
            }}
          />
        )}

        {/* Input bar */}
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="Mensagem..."
            placeholderTextColor={C.muted}
            value={text}
            onChangeText={setText}
            multiline
            onSubmitEditing={send}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <Animated.View style={{ transform: [{ scale: sendScale }] }}>
            <TouchableOpacity
              style={[s.sendBtn, !text.trim() && s.sendBtnDisabled]}
              onPress={send}
              disabled={!text.trim()}
              activeOpacity={0.8}
            >
              <Send color="#fff" size={16} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.bg },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  headerIcon:     { width: 38, height: 38, borderRadius: 12, backgroundColor: C.blueD, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(76,158,255,0.22)' },
  title:          { color: C.text, fontSize: 16, fontWeight: '800' },
  onlineRow:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: C.success },
  subtitle:       { color: C.muted, fontSize: 11, fontWeight: '500' },

  emptyWrap:      { flex: 1, alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon:      { width: 72, height: 72, borderRadius: 24, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 4 },
  emptyTitle:     { color: C.text, fontSize: 16, fontWeight: '700' },
  empty:          { color: C.muted, fontSize: 13, textAlign: 'center' },

  dateSep:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10 },
  dateLine:       { flex: 1, height: 1, backgroundColor: C.border },
  dateText:       { color: C.muted, fontSize: 11, fontWeight: '600' },

  bubbleWrap:     { maxWidth: '80%' },
  wrapMine:       { alignSelf: 'flex-end' },
  wrapOther:      { alignSelf: 'flex-start' },
  bubble:         { borderRadius: 18, padding: 11, paddingHorizontal: 14, gap: 3 },
  bubbleMine:     { borderBottomRightRadius: 4 },
  bubbleOther:    { borderBottomLeftRadius: 4, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  bubbleRole:     { color: C.blue, fontSize: 10, fontWeight: '700', marginBottom: 1 },
  bubbleTextMine: { color: '#fff', fontSize: 14, lineHeight: 20 },
  bubbleTextOther:{ color: C.text, fontSize: 14, lineHeight: 20 },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.5)', fontSize: 10, alignSelf: 'flex-end' },
  bubbleTimeOther:{ color: C.muted, fontSize: 10, alignSelf: 'flex-end' },

  inputBar:       { flexDirection: 'row', gap: 10, padding: 12, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: C.border, alignItems: 'flex-end', backgroundColor: C.bg },
  input:          { flex: 1, backgroundColor: C.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: C.text, fontSize: 14, borderWidth: 1, borderColor: C.border, maxHeight: 100 },
  sendBtn:        { width: 42, height: 42, borderRadius: 21, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled:{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
});
