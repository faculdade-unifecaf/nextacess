import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Bell, AlertTriangle, Info, Megaphone, BellOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../services/api';
import { C } from '../../../constants/theme';

type Aviso = {
  id: string; titulo: string; mensagem: string;
  tipo: string; prioridade: string; publico: string; created_at: string;
};

const TIPO_CFG: Record<string, { icon: any; color: string; bg: string }> = {
  'Urgente':     { icon: AlertTriangle, color: C.danger,  bg: 'rgba(239,68,68,0.1)'   },
  'Informativo': { icon: Info,          color: C.blue,    bg: 'rgba(76,158,255,0.1)'  },
  'Comunicado':  { icon: Megaphone,     color: C.warning, bg: 'rgba(245,158,11,0.1)'  },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `há ${d} dia${d > 1 ? 's' : ''}`;
  const h = Math.floor(diff / 3600000);
  if (h > 0) return `há ${h}h`;
  const m = Math.floor(diff / 60000);
  return m <= 1 ? 'agora mesmo' : `há ${m}min`;
}

export default function AvisosScreen() {
  const [avisos, setAvisos]     = useState<Aviso[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try { const { data } = await api.get('/avisos'); setAvisos(data); }
    catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={C.blue} size="large" /></View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Avisos</Text>
          <Text style={s.subtitle}>{avisos.length > 0 ? `${avisos.length} comunicado${avisos.length > 1 ? 's' : ''}` : 'Sem novidades'}</Text>
        </View>
        <View style={s.bellWrap}>
          <Bell color={C.blue} size={20} />
          {avisos.length > 0 && <View style={s.bellDot} />}
        </View>
      </View>

      <FlatList
        data={avisos}
        keyExtractor={i => i.id}
        contentContainerStyle={avisos.length === 0 ? s.emptyContainer : { padding: 16, gap: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.blue} />
        }
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <View style={s.emptyIconWrap}>
              <BellOff color={C.muted} size={36} />
            </View>
            <Text style={s.emptyTitle}>Nenhum aviso</Text>
            <Text style={s.emptyDesc}>Você está em dia! Novos comunicados aparecerão aqui.</Text>
            <Text style={s.emptyHint}>Puxe para baixo para atualizar</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg  = TIPO_CFG[item.tipo] ?? TIPO_CFG['Informativo'];
          const Icon = cfg.icon;
          return (
            <View style={s.card}>
              <View style={[s.cardAccent, { backgroundColor: cfg.color }]} />
              <View style={s.cardInner}>
                <View style={[s.iconWrap, { backgroundColor: cfg.bg }]}>
                  <Icon color={cfg.color} size={17} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.cardHeader}>
                    <Text style={s.cardTitle} numberOfLines={1}>{item.titulo}</Text>
                    <View style={[s.tipoBadge, { borderColor: cfg.color + '40' }]}>
                      <Text style={[s.tipoText, { color: cfg.color }]}>{item.tipo}</Text>
                    </View>
                  </View>
                  <Text style={s.msg} numberOfLines={2}>{item.mensagem}</Text>
                  <View style={s.metaRow}>
                    <Text style={s.meta}>{item.publico}</Text>
                    <Text style={s.metaDot}>·</Text>
                    <Text style={s.meta}>{timeAgo(item.created_at)}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.bg },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  title:         { color: C.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  subtitle:      { color: C.muted, fontSize: 13, fontWeight: '500', marginTop: 2 },
  bellWrap:      { position: 'relative', width: 40, height: 40, backgroundColor: C.surface, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  bellDot:       { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: C.danger, borderWidth: 2, borderColor: C.bg },

  emptyContainer:{ flex: 1, justifyContent: 'center' },
  emptyWrap:     { alignItems: 'center', paddingHorizontal: 40, gap: 10 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 28, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 8 },
  emptyTitle:    { color: C.text, fontSize: 18, fontWeight: '800' },
  emptyDesc:     { color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyHint:     { color: C.border, fontSize: 12, marginTop: 4 },

  card:          { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  cardAccent:    { height: 3 },
  cardInner:     { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  iconWrap:      { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, gap: 8 },
  cardTitle:     { color: C.text, fontWeight: '700', fontSize: 14, flex: 1 },
  tipoBadge:     { borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, flexShrink: 0 },
  tipoText:      { fontSize: 10, fontWeight: '700' },
  msg:           { color: C.muted, fontSize: 13, lineHeight: 19, marginBottom: 8 },
  metaRow:       { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta:          { color: C.muted, fontSize: 11 },
  metaDot:       { color: C.border, fontSize: 11 },
});
