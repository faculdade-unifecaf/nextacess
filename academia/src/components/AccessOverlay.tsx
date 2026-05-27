import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';
import { AccessResult } from '../hooks/useAccessResult';
import { C } from '../../constants/theme';

interface Props { result: AccessResult }

export default function AccessOverlay({ result }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(3200),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [result]);

  const ok    = result.autorizado;
  const color = ok ? C.success : C.danger;
  const Icon  = ok ? CheckCircle : XCircle;
  const label = ok ? 'Acesso Liberado' : 'Acesso Negado';
  const sub   = ok
    ? (result.empresa ? `Bem-vindo! ${result.empresa}` : 'Bem-vindo!')
    : (result.motivo ?? 'Sem autorização');

  return (
    <Animated.View style={[s.overlay, { opacity }]} pointerEvents="none">
      <View style={[s.card, { borderColor: color + '60', backgroundColor: color + '18' }]}>
        <Icon color={color} size={48} />
        <Text style={[s.label, { color }]}>{label}</Text>
        <Text style={s.nome}>{result.nome}</Text>
        <Text style={s.sub}>{sub}</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  card: {
    width: 280,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 32,
    alignItems: 'center',
    gap: 10,
  },
  label: { fontSize: 22, fontWeight: '800' },
  nome:  { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  sub:   { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center' },
});
