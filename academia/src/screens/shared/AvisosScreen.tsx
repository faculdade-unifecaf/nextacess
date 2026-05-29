import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AlertTriangle, Info, Megaphone } from 'lucide-react-native';
import ScreenHeader from '../../components/ScreenHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../../context/NotificationsContext';
import api from '../../../services/api';
import { C } from '../../../constants/theme';

type Aviso = { id: string; titulo: string; mensagem: string; tipo: string; prioridade: string; publico: string; created_at: string };

const TIPO_ICON: Record<string, any> = {
  'Urgente':      { icon: AlertTriangle, color: C.danger  },
  'Informativo':  { icon: Info,          color: C.blue    },
  'Comunicado':   { icon: Megaphone,     color: C.warning },
};

export default function AvisosScreen() {
  const { markAvisosRead }    = useNotifications();
  const [avisos, setAvisos]   = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { data } = await api.get('/avisos'); setAvisos(data); }
    catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useFocusEffect(useCallback(() => { markAvisosRead(); }, [markAvisosRead]));

  if (loading) return <View style={s.center}><ActivityIndicator color={C.blue} /></View>;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScreenHeader title="Avisos" />
      <FlatList
        data={avisos}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={C.blue} />}
        ListEmptyComponent={<Text style={s.empty}>Nenhum aviso no momento</Text>}
        renderItem={({ item }) => {
          const cfg = TIPO_ICON[item.tipo] ?? TIPO_ICON['Informativo'];
          const Icon = cfg.icon;
          return (
            <View style={s.card}>
              <View style={[s.iconWrap, { backgroundColor: cfg.color + '18' }]}>
                <Icon color={cfg.color} size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.row}>
                  <Text style={s.cardTitle}>{item.titulo}</Text>
                  <Text style={[s.badge, { color: cfg.color, borderColor: cfg.color + '40' }]}>{item.tipo}</Text>
                </View>
                <Text style={s.msg}>{item.mensagem}</Text>
                <Text style={s.meta}>{item.publico} · {new Date(item.created_at).toLocaleDateString('pt-BR')}</Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  center:   { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  header:   { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, paddingBottom: 12 },
  title:    { color: C.text, fontSize: 22, fontWeight: '800' },
  empty:    { color: C.muted, textAlign: 'center', marginTop: 60 },
  card:     { backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  row:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle:{ color: C.text, fontWeight: '700', flex: 1, marginRight: 8 },
  badge:    { fontSize: 10, fontWeight: '700', borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  msg:      { color: '#94a3b8', fontSize: 13, lineHeight: 19, marginBottom: 6 },
  meta:     { color: C.muted, fontSize: 11 },
});
