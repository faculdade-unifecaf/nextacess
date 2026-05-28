import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, LogOut, Shield, Briefcase, UserCheck, Building2, Layers } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../../services/api';
import { C } from '../../../constants/theme';

const ROLE_CFG: Record<string, { label: string; color: string; Icon: any }> = {
  admin:       { label: 'Administrador', color: C.warning, Icon: Shield    },
  funcionario: { label: 'Funcionário',   color: C.blue,    Icon: Briefcase },
  visitante:   { label: 'Visitante',     color: C.success, Icon: UserCheck },
};

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const [empresa, setEmpresa] = useState<{ nome: string; andar: number | null } | null>(null);

  useEffect(() => {
    if (!user?.empresa_id) return;
    api.get(`/empresas/${user.empresa_id}`)
      .then(({ data }) => setEmpresa({ nome: data.nome, andar: data.andar ?? null }))
      .catch(() => {});
  }, [user?.empresa_id]);

  if (!user) return null;

  const cfg     = ROLE_CFG[user.role] ?? ROLE_CFG['funcionario'];
  const initial = user.nome.charAt(0).toUpperCase();

  const confirmLogout = () =>
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <User color={C.blue} size={20} />
        <Text style={s.title}>Perfil</Text>
      </View>

      <View style={s.content}>
        {/* Avatar + nome + email */}
        <View style={s.avatarWrap}>
          <View style={[s.avatar, { backgroundColor: user.avatar_color || C.blue }]}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <Text style={s.name}>{user.nome}</Text>
          <Text style={s.email}>{user.email}</Text>
        </View>

        {/* Card: Tipo de acesso */}
        <InfoCard icon={<cfg.Icon size={16} color={cfg.color} />} label="Tipo de acesso" value={cfg.label} valueColor={cfg.color} />

        {/* Cards: Empresa e Andar (apenas para admin/funcionário com empresa) */}
        {empresa && (
          <>
            <InfoCard
              icon={<Building2 size={16} color={C.blue} />}
              label="Empresa"
              value={empresa.nome}
            />
            {empresa.andar !== null && (
              <InfoCard
                icon={<Layers size={16} color={C.muted} />}
                label="Andar"
                value={`${empresa.andar}º Andar`}
              />
            )}
          </>
        )}

        {/* Status do visitante */}
        {user.role === 'visitante' && user.visitanteStatus && (
          <InfoCard
            icon={<UserCheck size={16} color={C.success} />}
            label="Status"
            value={user.visitanteStatus}
          />
        )}

        <TouchableOpacity style={s.logoutBtn} onPress={confirmLogout} activeOpacity={0.8}>
          <LogOut color={C.danger} size={18} />
          <Text style={s.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoCard({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={s.card}>
      <View style={s.cardLeft}>
        {icon}
        <Text style={s.cardLabel}>{label}</Text>
      </View>
      <Text style={[s.cardValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bg },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, paddingBottom: 12 },
  title:      { color: C.text, fontSize: 22, fontWeight: '800' },
  content:    { flex: 1, padding: 20, gap: 12 },

  avatarWrap: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  avatar:     { width: 76, height: 76, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name:       { color: C.text, fontSize: 20, fontWeight: '700' },
  email:      { color: C.muted, fontSize: 14 },

  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardLabel: { color: C.muted, fontSize: 14 },
  cardValue: { color: C.text, fontSize: 14, fontWeight: '600' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    marginTop: 4,
  },
  logoutText: { color: C.danger, fontWeight: '700', fontSize: 15 },
});
