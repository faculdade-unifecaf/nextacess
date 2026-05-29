VENV = venv
PYTHON = $(VENV)/bin/python

.PHONY: run install setup dev-all

run:
	$(PYTHON) camera.py

install:
	python3 -m venv $(VENV)
	$(VENV)/bin/pip install --upgrade pip
	$(VENV)/bin/pip install -r requirements.txt

setup: install
	@echo ""
	@echo "Dependências instaladas. Para rodar: make run"

dev-all:
	@echo "================================"
	@echo "Iniciando todos os serviços..."
	@echo "================================"
	@cd ../back-end && npm run dev > /tmp/backend.log 2>&1 &
	@cd ../academia && npx expo start > /tmp/academia.log 2>&1 &
	@cd ../admin-web && npm run dev > /tmp/admin-web.log 2>&1 &
	@sleep 2
	@echo ""
	@echo "✓ Backend iniciado (http://localhost:3000)"
	@echo "✓ Academia iniciado (Expo)"
	@echo "✓ Admin-web iniciado (http://localhost:5173)"
	@echo ""
	@echo "Dica: Use 'make stop-all' para parar todos os serviços"

stop-all:
	@echo "Parando todos os serviços..."
	@pkill -f "npm run dev" || true
	@pkill -f "expo start" || true
	@echo "✓ Serviços parados"


