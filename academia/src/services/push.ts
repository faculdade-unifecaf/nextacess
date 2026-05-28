import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import api from '../../services/api';

// Exibe a notificação mesmo com o app aberto (banner + som)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let cachedToken: string | null = null;

// Pede permissão, obtém o ExpoPushToken e registra no back-end.
// Retorna o token (ou null se indisponível — emulador, Expo Go, sem permissão).
export async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[push] Notificações push exigem um dispositivo físico.');
    return null;
  }

  // Canal Android (obrigatório para som/heads-up)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4c9eff',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') {
    console.warn('[push] Permissão de notificação negada.');
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId;
  if (!projectId) {
    console.warn('[push] projectId do EAS não configurado — rode `eas init`.');
    return null;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    cachedToken = token;
    await api.post('/devices/register', { token });
    return token;
  } catch (err) {
    console.error('[push] falha ao registrar token:', err);
    return null;
  }
}

// Remove o token do back-end (chamar no logout)
export async function unregisterPush(): Promise<void> {
  if (!cachedToken) return;
  try {
    await api.post('/devices/unregister', { token: cachedToken });
  } catch (err) {
    console.error('[push] falha ao remover token:', err);
  } finally {
    cachedToken = null;
  }
}
