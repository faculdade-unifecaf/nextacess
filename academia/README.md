# NextAccess — App Mobile

Aplicativo React Native / Expo para funcionários, admins e visitantes do NextAccess.

## Pré-requisitos

- Node.js 20+
- Expo Go instalado no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

## Configurar

```bash
cp .env.example .env
# Edite EXPO_PUBLIC_API_URL com o IP do back-end
```

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

## Instalar e rodar

```bash
npm install

npm run lan       # mesma rede Wi-Fi — escaneia QR com Expo Go
npm run tunnel    # rede diferente — usa tunnel automático
npm run android   # emulador Android
npm run ios       # simulador iOS (macOS only)
```

## Roles disponíveis

| Role | Acesso |
|---|---|
| `admin` | Todas as telas + aprovação de visitantes |
| `funcionario` | Telas do usuário + aprovação de visitantes |
| `visitante` | Home (QR/solicitar acesso), Avisos, Estacionamento |

## Estrutura

```
src/
  context/        AuthContext, NotificationsContext
  navigation/     AppNavigator (tabs por role)
  screens/
    admin/        Telas exclusivas de admin
    funcionario/  Telas de funcionário
    visitante/    Home, Estacionamento
    shared/       Telas compartilhadas entre roles
  services/       Chamadas à API
```
