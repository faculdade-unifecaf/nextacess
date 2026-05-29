import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { C } from '../../constants/theme';

interface Props {
  title: string;
  subtitle?: string;
}

export default function ScreenHeader({ title, subtitle }: Props) {
  const navigation = useNavigation<any>();
  // openDrawer só existe quando a tela está dentro de um DrawerNavigator
  const hasDrawer = typeof navigation.openDrawer === 'function';

  return (
    <View style={s.root}>
      <View style={s.left}>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>

      {hasDrawer && (
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={s.menuBtn}
        >
          <Menu size={22} color={C.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  left:    { flex: 1, gap: 2 },
  title:   { color: C.text, fontSize: 22, fontWeight: '800' },
  subtitle:{ color: C.muted, fontSize: 12 },
  menuBtn: { padding: 4 },
});
