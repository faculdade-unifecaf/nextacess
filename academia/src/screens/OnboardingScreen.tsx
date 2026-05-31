import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode, UserPlus, Bell, ArrowRight, LogIn } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C } from '../../constants/theme';

// cast necessário — mesma limitação de tipos do SplashScreen
const AFlatList = Animated.FlatList as any;
const AView     = Animated.View as any;

const { width: W } = Dimensions.get('window');

interface Slide {
  key: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
}

const SLIDES: Slide[] = [
  {
    key: '1',
    Icon: QrCode,
    iconColor: C.blue,
    iconBg: 'rgba(76,158,255,0.12)',
    title: 'Acesso com QR Code',
    desc: 'Seu QR Code pessoal é gerado automaticamente e renovado a cada 30 segundos. Apresente na catraca para entrar com segurança.',
  },
  {
    key: '2',
    Icon: UserPlus,
    iconColor: C.warning,
    iconBg: 'rgba(245,158,11,0.12)',
    title: 'Controle de Visitantes',
    desc: 'Receba notificações quando visitantes chegam ao prédio e aprove ou negue o acesso diretamente pelo celular, sem sair do lugar.',
  },
  {
    key: '3',
    Icon: Bell,
    iconColor: C.success,
    iconBg: 'rgba(34,197,94,0.12)',
    title: 'Comunicação em Tempo Real',
    desc: 'Fique por dentro dos avisos do prédio e converse com a recepção pelo chat integrado. Tudo num só lugar.',
  },
];

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function OnboardingScreen({ navigation }: Props) {
  const onDone = () => navigation.replace('Login');
  const [index, setIndex]     = useState(0);
  const [slideH, setSlideH]   = useState(0);
  const flatRef               = useRef<FlatList>(null);
  const scrollX               = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      onDone();
    }
  };

  const isLast = index === SLIDES.length - 1;

  return (
    // absoluteFillObject garante tela cheia independente do layout pai
    <View style={s.root}>

      {/* Header com botão pular */}
      <SafeAreaView edges={['top']} style={s.header}>
        {!isLast && (
          <TouchableOpacity
            onPress={onDone}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={s.skipText}>Pular</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Slides — ocupa todo o espaço entre header e footer */}
      <AFlatList
        ref={flatRef as any}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item: Slide) => item.key}
        style={s.list}
        onLayout={(e: any) => setSlideH(e.nativeEvent.layout.height)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e: any) => {
          setIndex(Math.round(e.nativeEvent.contentOffset.x / W));
        }}
        renderItem={({ item }: { item: Slide }) => (
          // altura explícita medida via onLayout — FlatList items não aceitam flex
          <View style={[s.slide, { height: slideH }]}>
            <View style={[s.iconCircle, { backgroundColor: item.iconBg }]}>
              <item.Icon size={56} color={item.iconColor} strokeWidth={1.6} />
            </View>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.desc}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Footer: dots + botão */}
      <SafeAreaView edges={['bottom']} style={s.footer}>
        <View style={s.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * W, i * W, (i + 1) * W];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <AView key={i} style={[s.dot, { width: dotWidth, opacity }]} />
            );
          })}
        </View>

        <TouchableOpacity
          style={[s.btn, isLast && s.btnPrimary]}
          onPress={goNext}
          activeOpacity={0.82}
        >
          {isLast ? (
            <>
              <LogIn size={18} color="#fff" />
              <Text style={s.btnTextPrimary}>Fazer Login</Text>
            </>
          ) : (
            <>
              <Text style={s.btnTextSecondary}>Próximo</Text>
              <ArrowRight size={18} color={C.blue} />
            </>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.bg,
    zIndex: 998,          // abaixo do SplashScreen (999), acima do app
    flexDirection: 'column',
  },

  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 28,
    paddingVertical: 12,
    minHeight: 52,
  },
  skipText: {
    color: C.muted,
    fontSize: 14,
    fontWeight: '600',
  },

  list: { flex: 1 },

  slide: {
    width: W,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 24,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: C.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  desc: {
    color: C.muted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },

  footer: {
    paddingHorizontal: 32,
    paddingBottom: 12,
    paddingTop: 16,
    gap: 24,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: C.blue,
  },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(76,158,255,0.3)',
    backgroundColor: 'rgba(76,158,255,0.07)',
  },
  btnPrimary: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },
  btnTextSecondary: {
    color: C.blue,
    fontSize: 16,
    fontWeight: '700',
  },
  btnTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
