import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, Shield, Briefcase, UserCheck, Mail, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { C } from '../../../constants/theme';

const ROLE_CFG: Record<string, { label: string; color: string; icon: any }> = {
  admin:       { label: 'Administrador', color: C.warning, icon: Shield    },
  funcionario: { label: 'Funcionário',   color: C.blue,    icon: Briefcase },
  visitante:   { label: 'Visitante',     color: C.success, icon: UserCheck },
};

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const cfg     = ROLE_CFG[user.role] ?? ROLE_CFG['funcionario'];
  const RoleIcon = cfg.icon;
  const initial = user.nome.charAt(0).toUpperCase();
  const avatarColor = user.avatar_color || C.blue;

  const confirmLogout = () =>
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Perfil</Text>
      </View>

      <View style={s.content}>
        {/* Avatar section */}
        <View style={s.avatarSection}>
          <View style={[s.avatarRing, { borderColor: avatarColor + '60' }]}>
            <LinearGradient
              colors={[avatarColor, avatarColor + 'aa']}
              style={s.avatar}
            >
              <Text style={s.avatarText}>{initial}</Text>
            </LinearGradient>
          </View>
          <Text style={s.name}>{user.nome}</Text>
          <View style={[s.roleBadge, { backgroundColor: cfg.color + '14', borderColor: cfg.color + '35' }]}>
            <RoleIcon color={cfg.color} size={13} />
            <Text style={[s.roleText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Info card */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <View style={s.infoIconWrap}>
              <Mail color={C.muted} size={15} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.infoLabel}>E-mail</Text>
              <Text style={s.infoValue}>{user.email}</Text>
            </View>
          </View>
          <View style={s.separator} />
          <View style={s.infoRow}>
            <View style={s.infoIconWrap}>
              <RoleIcon color={C.muted} size={15} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.infoLabel}>Nível de acesso</Text>
              <Text style={s.infoValue}>{cfg.label}</Text>
            </View>
            <View style={[s.statusDot, { backgroundColor: cfg.color }]} />
          </View>
          {user.role === 'visitante' && (
            <>
              <View style={s.separator} />
              <View style={s.infoRow}>
                <View style={s.infoIconWrap}>
                  <UserCheck color={C.muted} size={15} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.infoLabel}>Status da visita</Text>
                  <Text style={s.infoValue}>{user.visitanteStatus ?? '—'}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={confirmLogout} activeOpacity={0.75}>
          <LogOut color={C.danger} size={17} />
          <Text style={s.logoutText}>Sair da conta</Text>
          <ChevronRight color={C.danger} size={16} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  header:       { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  title:        { color: C.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  content:      { flex: 1, paddingHorizontal: 20, paddingTop: 8, gap: 16 },

  avatarSection:{ alignItems: 'center', gap: 10, paddingVertical: 16 },
  avatarRing:   { width: 96, height: 96, borderRadius: 30, borderWidth: 3, padding: 3 },
  avatar:       { flex: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { color: '#fff', fontSize: 36, fontWeight: '800' },
  name:         { color: C.text, fontSize: 20, fontWeight: '700' },
  roleBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  roleText:     { fontWeight: '700', fontSize: 13 },

  infoCard:     { backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  infoRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  infoIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  infoLabel:    { color: C.muted, fontSize: 11, fontWeight: '600', marginBottom: 2 },
  infoValue:    { color: C.text, fontSize: 14, fontWeight: '600' },
  statusDot:    { width: 8, height: 8, borderRadius: 4 },
  separator:    { height: 1, backgroundColor: C.border, marginLeft: 62 },

  logoutBtn:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.18)' },
  logoutText:   { color: C.danger, fontWeight: '700', fontSize: 15 },
});
