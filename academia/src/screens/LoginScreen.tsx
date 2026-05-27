import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Lock, Mail, CreditCard, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { C } from '../../constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [cpf, setCpf]     = useState('');
  const [loading, setLoading] = useState(false);

  const formatCpf = (v: string) => v.replace(/\D/g, '').slice(0, 11);

  const handleLogin = async () => {
    if (!email.trim() || !cpf.trim()) { Alert.alert('Erro', 'Preencha email e CPF'); return; }
    setLoading(true);
    try {
      await login(email.trim(), cpf.trim());
    } catch {
      Alert.alert('Erro', 'Credenciais inválidas. Verifique seu email e CPF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <View style={s.header}>
            <View style={s.logoWrap}>
              <Lock color={C.blue} size={32} />
            </View>
            <Text style={s.title}>NEXTACCESS</Text>
            <Text style={s.subtitle}>Controle de Acesso</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Entrar na conta</Text>

            <View style={s.inputRow}>
              <Mail color={C.muted} size={16} />
              <TextInput
                style={s.input} placeholder="E-mail" placeholderTextColor={C.muted}
                value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none"
              />
            </View>

            <View style={s.inputRow}>
              <CreditCard color={C.muted} size={16} />
              <TextInput
                style={s.input} placeholder="CPF (somente números)" placeholderTextColor={C.muted}
                value={cpf} onChangeText={v => setCpf(formatCpf(v))}
                keyboardType="numeric" maxLength={11}
              />
            </View>

            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.6 }]}
              onPress={handleLogin} disabled={loading} activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <><Text style={s.btnText}>Entrar</Text><ChevronRight color="#fff" size={18} /></>
              }
            </TouchableOpacity>

            <Text style={s.hint}>Use seu email e CPF cadastrados pela recepção</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header:    { alignItems: 'center', marginBottom: 36 },
  logoWrap:  { width: 72, height: 72, borderRadius: 22, backgroundColor: C.blueD, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(76,158,255,0.3)' },
  title:     { color: C.text, fontSize: 28, fontWeight: '900', letterSpacing: 5 },
  subtitle:  { color: C.blue, fontSize: 12, letterSpacing: 3, marginTop: 4 },
  card:      { backgroundColor: C.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: C.border },
  cardTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  inputRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 12, borderWidth: 1, borderColor: C.border, gap: 10 },
  input:     { flex: 1, color: C.text, fontSize: 15 },
  btn:       { backgroundColor: C.blue, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  btnText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  hint:      { color: C.muted, fontSize: 11, textAlign: 'center', marginTop: 16, lineHeight: 16 },
});
