import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, CheckCircle, XCircle, Clock, Calendar, Users } from 'lucide-react-native';
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
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await api.get('/visitantes');
      setList(data.filter((v: Visitante) => v.status === 'Aguardando'));
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const aprovar = (v: Visitante) =>
    Alert.alert('Aprovar visitante', `Liberar acesso para ${v.nome_completo}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Aprovar', onPress: async () => {
        try {
          await api.patch(`/visitantes/${v.id}/aprovar`, { autorizado_por: user?.nome ?? 'Admin' });
          load();
        } catch (e: any) {
          Alert.alert('Erro', e?.response?.data?.error ?? 'Falha ao aprovar visitante');
        }
      }},
    ]);

  const negar = (v: Visitante) =>
    Alert.alert('Negar visitante', `Negar acesso para ${v.nome_completo}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Negar', style: 'destructive', onPress: async () => {
        try {
          await api.patch(`/visitantes/${v.id}/negar`);
          load();
        } catch (e: any) {
          Alert.alert('Erro', e?.response?.data?.error ?? 'Falha ao negar visitante');
        }
      }},
    ]);

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator color={C.blue} size="large" />
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Visitantes</Text>
          <Text style={s.subtitle}>Aguardando aprovação</Text>
        </View>
        {list.length > 0 && (
          <View style={s.countBadge}>
            <Text style={s.countText}>{list.length}</Text>
          </View>
        )}
      </View>

      {list.length > 0 && (
        <View style={s.alertBanner}>
          <LinearGradient
            colors={['rgba(245,158,11,0.18)', 'rgba(245,158,11,0.06)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Clock color={C.warning} size={16} />
          <Text style={s.alertText}>
            <Text style={{ fontWeight: '800' }}>{list.length} visitante{list.length > 1 ? 's' : ''}</Text>
            {' '}aguardando sua aprovação
          </Text>
        </View>
      )}

      <FlatList
        data={list}
        keyExtractor={i => i.id}
        contentContainerStyle={list.length === 0 ? s.emptyContainer : { padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.blue} />
        }
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <View style={s.emptyIconWrap}>
              <Users color={C.muted} size={36} />
            </View>
            <Text style={s.emptyTitle}>Tudo em dia!</Text>
            <Text style={s.emptyDesc}>Nenhum visitante aguardando aprovação no momento.</Text>
            <Text style={s.emptyHint}>Puxe para baixo para atualizar</Text>
          </View>
        }
        renderItem={({ item }) => {
          const initial = item.nome_completo.charAt(0).toUpperCase();
          const colors  = ['#4c9eff', '#b06cff', '#22d35e', '#f59e0b', '#ff5fa0'];
          const color   = colors[item.nome_completo.charCodeAt(0) % colors.length];

          return (
            <View style={s.card}>
              <View style={[s.cardAccent, { backgroundColor: C.warning }]} />
              <View style={s.cardTop}>
                <View style={[s.avatar, { backgroundColor: color + '22', borderColor: color + '44' }]}>
                  <Text style={[s.avatarText, { color }]}>{initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.nome_completo}</Text>
                  {item.empresa_nome && (
                    <Text style={s.sub}>{item.empresa_nome}</Text>
                  )}
                  {item.motivo && (
                    <Text style={s.motivo} numberOfLines={1}>{item.motivo}</Text>
                  )}
                </View>
              </View>

              <View style={s.metaRow}>
                <Calendar color={C.muted} size={12} />
                <Text style={s.metaText}>
                  {new Date(item.data_visita).toLocaleDateString('pt-BR')} às {item.hora_prevista}
                </Text>
              </View>

              <View style={s.actions}>
                <TouchableOpacity style={s.btnApprove} onPress={() => aprovar(item)} activeOpacity={0.75}>
                  <CheckCircle color={C.success} size={15} />
                  <Text style={[s.btnText, { color: C.success }]}>Aprovar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btnDeny} onPress={() => negar(item)} activeOpacity={0.75}>
                  <XCircle color={C.danger} size={15} />
                  <Text style={[s.btnText, { color: C.danger }]}>Negar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.bg },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  title:          { color: C.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  subtitle:       { color: C.muted, fontSize: 13, fontWeight: '500', marginTop: 2 },
  countBadge:     { width: 34, height: 34, borderRadius: 12, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center' },
  countText:      { color: '#fff', fontSize: 15, fontWeight: '800' },

  alertBanner:    { marginHorizontal: 16, marginBottom: 4, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', overflow: 'hidden' },
  alertText:      { color: C.warning, fontSize: 13, flex: 1 },

  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyWrap:      { alignItems: 'center', paddingHorizontal: 40, gap: 10 },
  emptyIconWrap:  { width: 80, height: 80, borderRadius: 28, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 8 },
  emptyTitle:     { color: C.text, fontSize: 18, fontWeight: '800' },
  emptyDesc:      { color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyHint:      { color: C.border, fontSize: 12, marginTop: 4 },

  card:           { backgroundColor: C.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.border, gap: 12, overflow: 'hidden' },
  cardAccent:     { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: 2 },
  cardTop:        { flexDirection: 'row', gap: 12, alignItems: 'center', paddingLeft: 8 },
  avatar:         { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  avatarText:     { fontWeight: '800', fontSize: 20 },
  name:           { color: C.text, fontWeight: '700', fontSize: 15 },
  sub:            { color: C.blue, fontSize: 12, marginTop: 2, fontWeight: '600' },
  motivo:         { color: C.muted, fontSize: 12, marginTop: 1 },

  metaRow:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 8, backgroundColor: C.card, borderRadius: 8, padding: 8 },
  metaText:       { color: C.muted, fontSize: 12 },

  actions:        { flexDirection: 'row', gap: 10, paddingLeft: 8 },
  btnApprove:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 12, paddingVertical: 11, borderWidth: 1, borderColor: 'rgba(34,197,94,0.28)' },
  btnDeny:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, paddingVertical: 11, borderWidth: 1, borderColor: 'rgba(239,68,68,0.28)' },
  btnText:        { fontWeight: '700', fontSize: 13 },
});
