# NextAccess

Sistema inteligente de controle de acesso corporativo utilizando QR Code dinâmico, painel web, aplicativo mobile e integração IoT.

---

## Comandos para rodar o projeto

```bash
# Back-end (Node.js)
cd back-end && npm run dev          # http://localhost:3000

# Admin-web (React)
cd admin-web && npm run dev         # http://localhost:5173

# App mobile — Expo Go (iOS e Android na mesma rede)
cd academia && npm run lan          # usa IP da rede → exp://192.168.0.104:8081

# App mobile — via browser Android (sem Expo Go)
cd academia && npm run web:lan      # abre em http://192.168.0.104:8081

# App mobile — tunnel (se LAN não funcionar)
cd academia && npm run tunnel

# IoT — câmera QR Code
cd iot && make qr

# IoT — reconhecimento facial
cd iot && make facial

# IoT — os dois ao mesmo tempo
cd iot && make ambos
```

---

## Rotas para teste

### Formulário de cadastro de visitante (público — sem login)
```
http://localhost:5173/cadastro
```
> Visitante preenche nome, CPF, email, empresa, motivo e data.
> Após submissão: status fica "Aguardando", nenhum email é enviado ainda.
> Quando a empresa aprovar pelo app mobile → email com QR Code é disparado.

### Admin-web (recepção)
```
http://localhost:5173/login
  usuário: recepcao@nextaccess.com
  senha:   recepcao123
```

### API back-end
```
http://localhost:3000/api
```

---

## Fluxo de visitantes

### Caso 1 — Visitante com celular / sem fila
```
1. Visitante escaneia QR Code impresso na recepção
2. Acessa http://localhost:5173/cadastro no próprio celular
3. Preenche o formulário (nome, CPF, email, empresa, motivo, data)
4. Status → "Aguardando"
5. Funcionário/admin da empresa recebe notificação no app mobile
6. Aprova ou nega pelo app
7. Se aprovado → QR Code enviado por email ao visitante
8. Visitante apresenta QR Code na câmera da catraca → acesso liberado
```

### Caso 2 — Visitante sem celular ou sem internet
```
1. Recepção cadastra o visitante manualmente no admin-web
2. Status → "Aguardando"
3. Funcionário/admin da empresa aprova pelo app mobile
4. Recepção vê status "Aprovado" no admin-web
5. Recepção libera a catraca manualmente
```

---

## Funcionalidades

### Painel Administrativo (admin-web)
- Dashboard com métricas em tempo real
- Gerenciamento de empresas (CNPJ, contato, andar/sala)
- Gerenciamento de usuários credenciados
- Controle de visitantes (aprovação, histórico)
- Avisos e notificações por tipo/público
- Logs de acesso (entrada/saída)
- Estacionamento com integração de pagamento

### Aplicativo Mobile
- QR Code pessoal para acesso
- Aprovação/negação de visitantes (admin e funcionário)
- Avisos e notificações push
- Perfil e configurações

### IoT
- Câmera de leitura de QR Code (`make qr`)
- Reconhecimento facial (`make facial`)
- Validação em tempo real via API

---

## Cartões de teste — Stripe

Use estes cartões no módulo de estacionamento (ambiente de teste):

| Número | Bandeira | Resultado |
|---|---|---|
| `4242 4242 4242 4242` | Visa | Pagamento aprovado |
| `5555 5555 5555 4444` | Mastercard | Pagamento aprovado |
| `4000 0025 6000 0002` | Visa | Sempre recusado |
| `4000 0000 0000 9995` | Visa | Recusado — saldo insuficiente |
| `4000 0000 0000 3220` | Visa | Requer autenticação 3D Secure |

**Dados de preenchimento (qualquer combinação):**
- **Validade:** qualquer data futura — ex: `12/29`
- **CVC:** qualquer 3 dígitos — ex: `123`
- **CEP:** qualquer 5 dígitos — ex: `12345`

> Estes cartões funcionam apenas com a chave `sk_test_...` no `.env`.
> Nenhuma cobrança real é efetuada.

---

## Tecnologias

- React + TypeScript (admin-web)
- React Native / Expo (app mobile)
- Node.js + Express + PostgreSQL (back-end)
- Supabase (banco de dados)
- Nodemailer + Gmail SMTP (envio de email)
- OpenCV + pyzbar (IoT QR Code)
- face_recognition (IoT facial)

---

## Objetivo

Plataforma moderna de gerenciamento de acesso predial corporativo com foco em segurança, automação e integração entre web, mobile e IoT.
