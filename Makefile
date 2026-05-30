# ══════════════════════════════════════════════════════════════
#  NextAccess — Makefile de desenvolvimento
#
#  COMANDOS RÁPIDOS:
#
#  make install-tunnel   →  instala o cloudflared (apenas na primeira vez)
#  make dev-full         →  inicia TUDO + tunnel para testar webhook do MP
#  make dev              →  inicia tudo SEM tunnel (desenvolvimento geral)
#  make tunnel           →  apenas cria o tunnel e atualiza o .env
#  make stop             →  para todos os serviços e restaura o .env
#  make logs             →  mostra os logs em tempo real
#  make help             →  lista todos os comandos com descrição
#
#  FLUXO RECOMENDADO:
#  1a vez:   make install-tunnel
#  Demais:   make dev-full
#  Parar:    make stop
#
# ══════════════════════════════════════════════════════════════

.PHONY: help dev dev-full tunnel stop logs install-tunnel

ENV_FILE    = back-end/.env
TUNNEL_LOG  = /tmp/nextaccess-tunnel.log
BACKEND_LOG = /tmp/nextaccess-backend.log
EXPO_LOG    = /tmp/nextaccess-expo.log
ADMINWEB_LOG= /tmp/nextaccess-adminweb.log

# ──────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  NextAccess — Comandos disponíveis"
	@echo ""
	@echo "  make dev            Inicia back-end, admin-web e Expo"
	@echo "  make dev-full       Inicia tudo + tunnel (webhook Mercado Pago)"
	@echo "  make tunnel         Só cria o tunnel e atualiza o .env"
	@echo "  make stop           Para tudo e restaura .env"
	@echo "  make logs           Mostra logs em tempo real"
	@echo "  make install-tunnel Instala o cloudflared (necessário uma vez)"
	@echo ""

# ── Apenas os serviços (sem tunnel) ───────────────────────────
dev:
	@echo ""
	@echo "  ======================================"
	@echo "   NextAccess — Iniciando servicos"
	@echo "  ======================================"
	@(cd back-end && npm run dev  > $(BACKEND_LOG)  2>&1) &
	@(cd academia  && npx expo start > $(EXPO_LOG)    2>&1) &
	@(cd admin-web && npm run dev  > $(ADMINWEB_LOG) 2>&1) &
	@sleep 4
	@echo ""
	@echo "  Backend   ->  http://localhost:3000"
	@echo "  Admin-web ->  http://localhost:5173"
	@echo "  Expo      ->  make logs (para ver QR code)"
	@echo ""
	@echo "  make logs    ver logs em tempo real"
	@echo "  make stop    parar tudo"
	@echo ""

# ── Tunnel + todos os serviços (para testar webhook do MP) ────
dev-full: tunnel
	@echo ""
	@echo "  ======================================"
	@echo "   NextAccess — Iniciando servicos"
	@echo "  ======================================"
	@(cd back-end && npm run dev  > $(BACKEND_LOG)  2>&1) &
	@(cd academia  && npx expo start > $(EXPO_LOG)    2>&1) &
	@(cd admin-web && npm run dev  > $(ADMINWEB_LOG) 2>&1) &
	@sleep 4
	@echo ""
	@echo "  Backend   ->  http://localhost:3000"
	@echo "  Admin-web ->  http://localhost:5173"
	@echo "  Expo      ->  make logs (para ver QR code)"
	@TUNNEL_URL=$$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' $(TUNNEL_LOG) | head -1); \
	echo "  Webhook   ->  $$TUNNEL_URL"
	@echo ""
	@echo "  make logs    ver logs em tempo real"
	@echo "  make stop    parar tudo (restaura .env)"
	@echo ""

# ── Cria tunnel e atualiza BACKEND_URL no .env automaticamente ─
tunnel:
	@if ! command -v cloudflared > /dev/null 2>&1; then \
		echo ""; \
		echo "  ERRO: cloudflared nao encontrado."; \
		echo "  Instale com:  make install-tunnel"; \
		echo ""; \
		exit 1; \
	fi
	@echo ""
	@echo "  Criando tunnel Cloudflare..."
	@cloudflared tunnel --url http://localhost:3000 > $(TUNNEL_LOG) 2>&1 &
	@sleep 8
	@TUNNEL_URL=$$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' $(TUNNEL_LOG) | head -1); \
	if [ -z "$$TUNNEL_URL" ]; then \
		echo "  ERRO: Tunnel nao iniciou. Verifique conexao e tente novamente."; \
		exit 1; \
	fi; \
	sed -i "s|^BACKEND_URL=.*|BACKEND_URL=$$TUNNEL_URL|" $(ENV_FILE); \
	echo "  Tunnel ativo  ->  $$TUNNEL_URL"; \
	echo "  BACKEND_URL atualizado no .env"
	@echo ""

# ── Para tudo e restaura .env ──────────────────────────────────
stop:
	@echo ""
	@echo "  Parando todos os servicos..."
	@pkill -f "npm run dev"  2>/dev/null || true
	@pkill -f "expo start"   2>/dev/null || true
	@pkill -f "cloudflared"  2>/dev/null || true
	@sed -i "s|^BACKEND_URL=.*|BACKEND_URL=http://localhost:3000|" $(ENV_FILE) 2>/dev/null || true
	@echo "  Servicos parados"
	@echo "  BACKEND_URL restaurado para http://localhost:3000"
	@echo ""

# ── Logs em tempo real de todos os serviços ───────────────────
logs:
	@tail -f $(BACKEND_LOG) $(EXPO_LOG) $(ADMINWEB_LOG) 2>/dev/null || \
		echo "  Nenhum log disponivel ainda. Rode primeiro: make dev"

# ── Instala cloudflared (necessário apenas uma vez) ────────────
install-tunnel:
	@echo ""
	@echo "  Instalando cloudflared..."
	@curl -fsSL \
		https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
		-o /tmp/cloudflared.deb 2>/dev/null && \
	sudo dpkg -i /tmp/cloudflared.deb > /dev/null 2>&1 && \
	rm /tmp/cloudflared.deb && \
	echo "  cloudflared instalado com sucesso" && \
	echo "  Agora rode: make dev-full" || \
	( echo "  Falha no download. Tentando via snap..."; \
	  sudo snap install cloudflared && echo "  cloudflared instalado via snap" )
	@echo ""
