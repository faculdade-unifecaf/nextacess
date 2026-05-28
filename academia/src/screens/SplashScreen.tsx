import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';
import { Lock } from 'lucide-react-native';
import { C } from '../../constants/theme';

// cast necessário — definições do Animated.View/Text são excessivamente estritas nesta config TS
const AView = Animated.View as any;
const AText = Animated.Text as any;

interface Props {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: Props) {
  const logoScale     = useRef(new Animated.Value(0.72)).current;
  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const ringScale     = useRef(new Animated.Value(1)).current;
  const ringOpacity   = useRef(new Animated.Value(0)).current;
  const textOpacity   = useRef(new Animated.Value(0)).current;
  const subOpacity    = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fase 1 — entrada do logo (0–700ms)
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(ringOpacity, {
        toValue: 1,
        duration: 600,
        delay: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fase 2 — texto aparece
      Animated.stagger(120, [
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(subOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Anel pulsando continuamente
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Fase 3 — saída suave e chama onDone
    const exit = setTimeout(() => {
      pulse.stop();
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 550,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => onDone());
    }, 2400);

    return () => {
      clearTimeout(exit);
      pulse.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AView style={[s.container, { opacity: screenOpacity }]}>

      {/* Glow difuso atrás do ícone */}
      <AView
        style={[s.glow, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
      />

      {/* Anel com pulso */}
      <AView
        style={[s.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
      />

      {/* Caixa do cadeado */}
      <AView
        style={[s.iconBox, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        <Lock size={38} color="#fff" strokeWidth={2.2} />
      </AView>

      {/* Nome */}
      <AText style={[s.name, { opacity: textOpacity }]}>
        NEXTACCESS
      </AText>

      {/* Subtítulo */}
      <AText style={[s.sub, { opacity: subOpacity }]}>
        Controle de Acesso Inteligente
      </AText>

    </AView>
  );
}

const ICON_SIZE = 88;
const RING_SIZE = 130;
const GLOW_SIZE = 180;

const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  glow: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    backgroundColor: 'rgba(76,158,255,0.13)',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(76,158,255,0.35)',
  },
  iconBox: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 24,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    // glow azul no ícone
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  name: {
    marginTop: 32,
    color: C.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },
  sub: {
    marginTop: 8,
    color: C.muted,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
