import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare, Send } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../../services/api';
import { C } from '../../../constants/theme';

type Msg = { id: string; from_role: string; texto: string; created_at: string };

export default function ChatScreen() {
  const { user }              = useAuth();
  const [msgs, setMsgs]       = useState<Msg[]>([]);
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro]       = useState<string | null>(null);
  const flatRef               = useRef<FlatList>(null);

  const empresaId = user?.empresa_id;

  const load = useCallback(async () => {
    if (!empresaId) { setLoading(false); return; }
    try {
      const { data } = await api.get(`/chat/${empresaId}`);
      setMsgs(data);
      setErro(null);
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e?.message ?? 'Erro ao carregar mensagens';
      setErro(msg);
      console.error('[Chat] GET erro:', msg);
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

  const send = async () => {
    const t = text.trim();
    if (!t || !empresaId) return;
    setText('');

    // update otimista — aparece na hora
    const tempMsg: Msg = {
      id: `temp-${Date.now()}`,
      from_role: user?.role ?? 'admin',
      texto: t,
      created_at: new Date().toISOString(),
    };
    setMsgs(prev => [...prev, tempMsg]);

    try {
      await api.post(`/chat/${empresaId}`, { from_role: user?.role, texto: t });
      await load(); // substitui temp pela versão real do servidor
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e?.message ?? 'Falha ao enviar mensagem';
      console.error('[Chat] POST erro:', msg, 'from_role:', user?.role, 'empresa:', empresaId);
      // remove msg temporária em caso de falha
      setMsgs(prev => prev.filter(m => m.id !== tempMsg.id));
      setText(t);
      Alert.alert('Erro ao enviar', msg);
    }
  };

  if (!empresaId) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.center}>
        <Text style={s.empty}>Você não está associado a uma empresa</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <MessageSquare color={C.blue} size={20} />
        <View>
          <Text style={s.title}>Suporte</Text>
          <Text style={s.subtitle}>Chat com a Recepção</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <View style={s.center}><ActivityIndicator color={C.blue} /></View>
        ) : erro ? (
          <View style={s.center}>
            <Text style={[s.empty, { color: C.danger, paddingHorizontal: 24, textAlign: 'center' }]}>{erro}</Text>
            <TouchableOpacity onPress={load} style={{ marginTop: 12, padding: 8 }}>
              <Text style={{ color: C.blue, fontSize: 13 }}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={msgs}
            keyExtractor={i => i.id}
            contentContainerStyle={{ padding: 16, gap: 8 }}
            ListEmptyComponent={
              <Text style={[s.empty, { marginTop: 40 }]}>Nenhuma mensagem ainda</Text>
            }
            renderItem={({ item }) => {
              const mine = item.from_role === user?.role;
              return (
                <View style={[s.bubble, mine ? s.bubbleMine : s.bubbleOther]}>
                  {!mine && <Text style={s.bubbleRole}>Recepção</Text>}
                  <Text style={[s.bubbleText, { color: mine ? '#fff' : C.text }]}>
                    {item.texto}
                  </Text>
                  <Text style={[s.bubbleTime, { color: mine ? 'rgba(255,255,255,0.55)' : C.muted }]}>
                    {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              );
            }}
          />
        )}

        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="Digite uma mensagem..."
            placeholderTextColor={C.muted}
            value={text}
            onChangeText={setText}
            multiline
            onSubmitEditing={send}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[s.sendBtn, !text.trim() && { opacity: 0.4 }]}
            onPress={send}
            disabled={!text.trim()}
          >
            <Send color="#fff" size={16} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.bg },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  title:       { color: C.text, fontSize: 18, fontWeight: '800' },
  subtitle:    { color: C.muted, fontSize: 12 },
  empty:       { color: C.muted, textAlign: 'center' },
  bubble:      { maxWidth: '80%', borderRadius: 14, padding: 12, gap: 4 },
  bubbleMine:  { alignSelf: 'flex-end', backgroundColor: C.blue, borderBottomRightRadius: 4 },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderBottomLeftRadius: 4 },
  bubbleRole:  { color: C.blue, fontSize: 10, fontWeight: '700' },
  bubbleText:  { fontSize: 14, lineHeight: 20 },
  bubbleTime:  { fontSize: 10, alignSelf: 'flex-end' },
  inputBar:    { flexDirection: 'row', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: C.border, alignItems: 'flex-end' },
  input:       { flex: 1, backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: C.text, fontSize: 14, borderWidth: 1, borderColor: C.border, maxHeight: 100 },
  sendBtn:     { width: 40, height: 40, borderRadius: 12, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
});
