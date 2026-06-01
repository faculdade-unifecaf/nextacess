# NextAccess

Sistema inteligente de controle de acesso corporativo com QR Code dinâmico, painel web, aplicativo mobile e integração IoT.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Git | qualquer | https://git-scm.com |
| Node.js | 20 LTS | https://nodejs.org |
| Python | 3.10 ou 3.11 | https://www.python.org (só para IoT) |
| Expo Go | qualquer | App Store / Play Store (no celular) |

> **Windows + IoT:** leia `iot/SETUP_WINDOWS.md` antes de instalar o Python.

---

## 1. Clonar o repositório

```bash
git clone https://github.com/faculdade-unifecaf/nextacess.git
cd nextacess
```

---

## 2. Configurar variáveis de ambiente

Cada módulo tem um `.env.example`. Copie e preencha com as credenciais reais.

### back-end
```bash
cp back-end/.env.example back-end/.env
```

```env
# Banco de dados (Supabase / Neon)
DATABASE_URL=postgresql://user:password@host:5432/postgres
SUPABASE_URL=https://xxxx.supabase.co
SERVICE_ROLE_KEY=your-supabase-service-role-key

# Auth
JWT_SECRET=troque-por-uma-string-aleatoria-longa
ADMIN_EMAIL=recepcao@nextaccess.com
ADMIN_SENHA=sua-senha-aqui

# Servidor
PORT=3000
BACKEND_URL=http://localhost:3000

# CORS (separe por vírgula; use * para liberar tudo em dev)
CORS_ORIGINS=*

# Email (Gmail SMTP — use Senha de App, não a senha normal)
GMAIL_USER=seu-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Deep link do app
APP_URL=nextaccess://
```

### admin-web
```bash
cp admin-web/.env.example admin-web/.env
```

```env
VITE_API_URL=http://localhost:3000
```

### academia (app mobile)
```bash
cp academia/.env.example academia/.env
```

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

> Para acessar de outro dispositivo na mesma rede, substitua `localhost` pelo IP da sua máquina (ex: `192.168.1.100`).

---

## 3. Instalar dependências

```bash
# Back-end
cd back-end && npm install

# Admin-web
cd ../admin-web && npm install

# App mobile
cd ../academia && npm install
```

---

## 4. Rodar o projeto

Abra um terminal para cada serviço:

```bash
# Terminal 1 — Back-end (API)
cd back-end && npm run dev
# → http://localhost:3000

# Terminal 2 — Admin-web (painel da recepção)
cd admin-web && npm run dev
# → http://localhost:5173

# Terminal 3 — App mobile (Expo)
cd academia && npm run lan
# → Escaneia o QR Code com o Expo Go no celular
```

**Atalho — rodar tudo de uma vez (Linux/macOS):**
```bash
make dev
```

> Para ver os logs quando usar `make dev`: `make logs`
> Para parar tudo: `make stop`

---

## 5. IoT — Câmera QR e Reconhecimento Facial

### Primeira vez (instala dependências Python)
```bash
cd iot && make install
```

### Rodar
```bash
# Leitor de QR Code (catraca)
cd iot && make qr

# Reconhecimento facial (estacionamento)
cd iot && make facial

# Ambos ao mesmo tempo
cd iot && make ambos

# Listar câmeras disponíveis
cd iot && make camera-list
```

### Variável de ambiente do IoT
```bash
# Linux / macOS
export NEXTACCESS_API_URL=http://localhost:3000

# Windows (PowerShell)
$env:NEXTACCESS_API_URL = "http://localhost:3000"
```

> **Windows:** consulte `iot/SETUP_WINDOWS.md` para instalar `dlib` e `pyzbar` corretamente.

---

## 6. Tunnel (testar de outra rede / celular externo)

```bash
# Instala o cloudflared (uma vez só)
make install-tunnel

# Sobe tudo + tunnel automático (webhook Mercado Pago incluído)
make dev-full
```

Ou manualmente:
```bash
cloudflared tunnel --url http://localhost:3000   # expõe o back-end
cloudflared tunnel --url http://localhost:5173   # expõe o admin-web
```

---

## Rotas para teste

| Recurso | URL |
|---|---|
| Admin-web (login) | http://localhost:5173/login |
| Formulário público de visitante | http://localhost:5173/cadastro |
| API back-end | http://localhost:3000/api |

**Credenciais padrão do admin-web:**
```
usuário: recepcao@nextaccess.com
senha:   (conforme ADMIN_SENHA no .env)
```

---

## Cartões de teste — Stripe

Use no módulo de estacionamento (ambiente de teste):

| Número | Bandeira | Resultado |
|---|---|---|
| `4242 4242 4242 4242` | Visa | Aprovado |
| `5555 5555 5555 4444` | Mastercard | Aprovado |
| `4000 0025 6000 0002` | Visa | Sempre recusado |
| `4000 0000 0000 9995` | Visa | Saldo insuficiente |
| `4000 0000 0000 3220` | Visa | Requer 3D Secure |

**Dados de preenchimento:** validade futura (ex: `12/29`), CVC qualquer (ex: `123`), CEP qualquer (ex: `12345`).

> Funciona apenas com `STRIPE_SECRET_KEY=sk_test_...`. Nenhuma cobrança real é feita.

---

## Fluxo de visitantes

### Caso 1 — Visitante com celular
```
1. Escaneia QR Code impresso na recepção
2. Preenche o formulário público (localhost:5173/cadastro)
3. Status → "Aguardando"
4. Funcionário/admin recebe notificação no app e aprova
5. QR Code enviado por email ao visitante
6. Visitante apresenta QR Code na câmera da catraca → acesso liberado
```

### Caso 2 — Visitante sem celular
```
1. Recepção cadastra manualmente no admin-web
2. Funcionário/admin aprova pelo app mobile
3. Recepção vê status "Aprovado" e libera a catraca
```

### Caso 3 — Visitante recorrente pelo app
```
1. Visitante instala o app e loga com email + CPF
2. Solicita acesso pelo app (seleciona empresa, data, horário)
3. Admin da empresa aprova
4. QR Code aparece direto no app
5. Escaneia na catraca — entrada e saída registradas automaticamente
```

---

## Funcionalidades

### Admin-web (recepção)
- Dashboard com métricas em tempo real
- Gerenciamento de empresas, usuários e visitantes
- Aprovação/negação de solicitações de acesso
- Avisos e notificações por tipo/público
- Logs de acesso (entrada/saída)
- Estacionamento com pagamento integrado (Stripe / Mercado Pago)

### App mobile
- Login para funcionários, admins e visitantes
- QR Code pessoal dinâmico para acesso
- Solicitação e aprovação de visitas
- Avisos e notificações push
- Estacionamento com pagamento pelo app

### IoT
- Câmera de leitura de QR Code (`make qr`)
- Reconhecimento facial para estacionamento (`make facial`)
- Validação em tempo real via API

---

## Tecnologias

- **Admin-web:** React + TypeScript + Vite
- **App mobile:** React Native + Expo
- **Back-end:** Node.js + Express + TypeScript + PostgreSQL
- **Banco de dados:** Supabase / Neon
- **Email:** Nodemailer + Gmail SMTP
- **Pagamentos:** Stripe + Mercado Pago
- **IoT:** Python + OpenCV + pyzbar + face_recognition
- **Notificações push:** Expo Push Notifications
