# NextAccess — Admin Web

Painel administrativo React + TypeScript + Vite para recepção e gestão do NextAccess.

## Pré-requisitos

- Node.js 20+

## Configurar

```bash
cp .env.example .env
# Edite VITE_API_URL com a URL do back-end
```

```env
VITE_API_URL=http://localhost:3000
```

## Instalar e rodar

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Build para produção

```bash
npm run build
# Arquivos gerados em dist/
```

## Páginas principais

| Rota | Descrição |
|---|---|
| `/login` | Autenticação |
| `/` | Dashboard com métricas |
| `/empresas` | Gerenciamento de empresas |
| `/funcionarios` | Gerenciamento de usuários |
| `/visitantes` | Controle e aprovação de visitantes |
| `/cadastro` | Formulário público de cadastro de visitante |
| `/avisos` | Avisos e notificações |
| `/logs` | Histórico de acessos |
| `/estacionamento` | Controle e pagamento de estacionamento |
