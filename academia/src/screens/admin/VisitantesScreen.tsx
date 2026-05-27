import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../../services/api';
import { C } from '../../../constants/theme';

type Visitante = {
  id: string; nome_completo: string; empresa_nome?: string;
  motivo?: string; data_visita: string; hora_prevista: string; status: string;
};

export default function VisitantesScreen() {
  const { user }              = useAuth();
  const [list, setList]       = useState<Visitante[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { data } = await api.get('/visitantes'); setList(data.filter((v: Visitante) => v.status === 'Aguardando')); }
    catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const aprovar = (v: Visitante) =>
    Alert.alert('Aprovar visitante', `Liberar acesso para ${v.nome_completo}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Aprovar', onPress: async () => {
        await api.patch(`/visitantes/${v.id}/aprovar`, { autorizado_por: user!.nome });
        load();
      }},
    ]);

  const negar = (v: Visitante) =>
    Alert.alert('Negar visitante', `Negar acesso para ${v.nome_completo}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Negar', style: 'destructive', onPress: async () => {
        await api.patch(`/visitantes/${v.id}/negar`);
        load();
      }},
    ]);

  if (loading) return <View style={s.center}><ActivityIndicator color={C.blue} /></View>;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <UserPlus color={C.blue} size={20} />
        <Text style={s.title}>Visitantes</Text>
        {list.length > 0 && <View style={s.badge}><Text style={s.badgeText}>{list.length}</Text></View>}
      </View>

      <FlatList
        data={list}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={C.blue} />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Clock color={C.muted} size={40} />
            <Text style={s.empty}>Nenhum visitante aguardando</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardTop}>
              <View style={s.avatarWrap}>
                <Text style={s.avatarText}>{item.nome_completo.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.nome_completo}</Text>
                {item.empresa_nome && <Text style={s.sub}>{item.empresa_nome}</Text>}
                {item.motivo && <Text style={s.sub}>{item.motivo}</Text>}
              </View>
            </View>
            <View style={s.meta}>
              <Text style={s.metaText}>📅 {new Date(item.data_visita).toLocaleDateString('pt-BR')} às {item.hora_prevista}</Text>
            </View>
            <View style={s.actions}>
              <TouchableOpacity style={s.btnApprove} onPress={() => aprovar(item)} activeOpacity={0.8}>
                <CheckCircle color={C.success} size={16} />
                <Text style={[s.btnText, { color: C.success }]}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnDeny} onPress={() => negar(item)} activeOpacity={0.8}>
                <XCircle color={C.danger} size={16} />
                <Text style={[s.btnText, { color: C.danger }]}>Negar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bg },
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, paddingBottom: 12 },
  title:      { color: C.text, fontSize: 22, fontWeight: '800' },
  badge:      { backgroundColor: C.danger, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:  { color: '#fff', fontSize: 12, fontWeight: '800' },
  emptyWrap:  { alignItems: 'center', paddingTop: 60, gap: 12 },
  empty:      { color: C.muted, fontSize: 14 },
  card:       { backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, gap: 12 },
  cardTop:    { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatarWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.blueD, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  avatarText: { color: C.blue, fontWeight: '800', fontSize: 18 },
  name:       { color: C.text, fontWeight: '700', fontSize: 15 },
  sub:        { color: C.muted, fontSize: 12, marginTop: 2 },
  meta:       { backgroundColor: C.card, borderRadius: 8, padding: 8 },
  metaText:   { color: C.muted, fontSize: 12 },
  actions:    { flexDirection: 'row', gap: 10 },
  btnApprove: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  btnDeny:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  btnText:    { fontWeight: '700', fontSize: 13 },
});
