import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Shield, Briefcase, UserCheck } from 'lucide-react-native';
import ScreenHeader from '../../components/ScreenHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../../services/api';
import { C } from '../../../constants/theme';

const ROLE_LABEL: Record<string, { label: string; color: string; icon: any }> = {
  admin:       { label: 'Administrador', color: C.warning, icon: Shield    },
  funcionario: { label: 'Funcionário',   color: C.blue,    icon: Briefcase },
  visitante:   { label: 'Visitante',     color: C.success, icon: UserCheck },
};

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const [empresa, setEmpresa] = useState<{ nome: string; andar: string } | null>(null);

  useEffect(() => {
    if (user?.empresa_id) {
      api.get(`/empresas/${user.empresa_id}`)
        .then(({ data }) => setEmpresa({ nome: data.nome, andar: data.andar }))
        .catch(() => {});
    }
  }, [user?.empresa_id]);

  if (!user) return null;

  const roleInfo = ROLE_LABEL[user.role] ?? ROLE_LABEL['funcionario'];
  const RoleIcon = roleInfo.icon;
  const initial  = user.nome.charAt(0).toUpperCase();

  const confirmLogout = () =>
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScreenHeader title="Perfil" />

      <View style={s.content}>
        <View style={s.avatarWrap}>
          <View style={[s.avatar, { backgroundColor: user.avatar_color || C.blue }]}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <Text style={s.name}>{user.nome}</Text>
          <Text style={s.email}>{user.email}</Text>
        </View>

        <View style={s.cards}>
          <InfoCard
            icon={<RoleIcon color={roleInfo.color} size={18} />}
            label="Tipo de acesso"
            value={roleInfo.label}
            accent={roleInfo.color}
          />
          {empresa && (
            <InfoCard
              icon={<Briefcase color={C.blue} size={18} />}
              label="Empresa"
              value={empresa.nome}
              accent={C.blue}
            />
          )}
          {empresa && (
            <InfoCard
              icon={<Shield color={C.muted} size={18} />}
              label="Andar"
              value={`${empresa.andar}º Andar`}
              accent={C.muted}
            />
          )}
          {user.role === 'visitante' && (
            <InfoCard
              icon={<UserCheck color={C.success} size={18} />}
              label="Status"
              value={user.visitanteStatus ?? '—'}
              accent={C.success}
            />
          )}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={confirmLogout} activeOpacity={0.8}>
          <LogOut color={C.danger} size={18} />
          <Text style={s.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <View style={[s.card, { borderLeftColor: accent }]}>
      <View style={[s.cardIcon, { backgroundColor: accent + '18' }]}>{icon}</View>
      <View style={s.cardText}>
        <Text style={s.cardLabel}>{label}</Text>
        <Text style={s.cardValue}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bg },
  content:    { flex: 1, padding: 20, gap: 16 },
  avatarWrap: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  avatar:     { width: 76, height: 76, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name:       { color: C.text, fontSize: 20, fontWeight: '700' },
  email:      { color: C.muted, fontSize: 14 },
  cards:      { gap: 10 },
  card:       { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, padding: 16 },
  cardIcon:   { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardText:   { flex: 1 },
  cardLabel:  { color: C.muted, fontSize: 11, fontWeight: '600', marginBottom: 2 },
  cardValue:  { color: C.text, fontSize: 15, fontWeight: '700' },
  logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  logoutText: { color: C.danger, fontWeight: '700', fontSize: 15 },
});
