# ══════════════════════════════════════════════════════════════
#  NextAccess IoT — Makefile
#
#  COMANDOS RÁPIDOS:
#
#  make install     →  instala todas as dependências Python (primeira vez)
#  make run         →  roda o leitor de QR Code (câmera embutida)
#  make facial      →  roda o reconhecimento facial (câmera USB ou embutida)
#  make ambos       →  roda QR e facial ao mesmo tempo (câmeras separadas)
#  make diagnostico →  testa se a câmera e o QR estão funcionando
#  make camera-list →  lista todas as câmeras disponíveis no sistema
#
#  PRIMEIRA VEZ:
#  1. make install
#  2. make facial     (para testar com câmera embutida)
#
#  COM CÂMERA USB:
#  Edite facial_parking.py e troque: CAMERA_IDX = None  →  CAMERA_IDX = 1
#
# ══════════════════════════════════════════════════════════════

VENV   = venv
PYTHON = $(VENV)/bin/python
PIP    = $(VENV)/bin/pip

.PHONY: install run facial ambos diagnostico camera-list setup

# ── Instala tudo (inclui dependências do dlib/face_recognition) ──
install:
	@echo ""
	@echo "  Instalando dependencias do sistema (cmake, build-tools)..."
	@sudo apt-get install -y cmake build-essential libopenblas-dev liblapack-dev \
		libx11-dev libgtk-3-dev python3-dev > /dev/null 2>&1 || \
		echo "  Aviso: apt-get falhou — tente manualmente se necessario"
	@echo "  Criando ambiente virtual..."
	@python3 -m venv $(VENV)
	@$(PIP) install --upgrade pip setuptools wheel -q
	@echo "  Instalando opencv, requests, pyzbar..."
	@$(PIP) install "opencv-python>=4.8.0" "pyzbar>=0.1.9" "requests>=2.31.0" "pillow>=12.2.0" -q
	@echo "  Instalando face_recognition (pode demorar alguns minutos)..."
	@$(PIP) install "face_recognition>=1.3.0"
	@echo ""
	@echo "  Dependencias instaladas com sucesso."
	@echo "  Para testar: make facial"
	@echo ""

# ── QR Code (câmera embutida / índice 0) ──────────────────────
run:
	$(PYTHON) camera.py

# ── Reconhecimento facial (auto-detecta câmera) ───────────────
facial:
	$(PYTHON) facial_parking.py

# ── Roda os dois ao mesmo tempo (cada um em sua câmera) ───────
ambos:
	@echo "  Iniciando QR Code e Facial em paralelo..."
	@$(PYTHON) camera.py        > /tmp/iot-qr.log     2>&1 &
	@$(PYTHON) facial_parking.py > /tmp/iot-facial.log 2>&1 &
	@echo "  QR Code  -> /tmp/iot-qr.log"
	@echo "  Facial   -> /tmp/iot-facial.log"
	@echo "  Para parar: make stop"

stop:
	@pkill -f "camera.py"        2>/dev/null || true
	@pkill -f "facial_parking.py" 2>/dev/null || true
	@echo "  IoT parado."

# ── Diagnóstico da câmera ─────────────────────────────────────
diagnostico:
	$(PYTHON) diagnostico.py

# ── Lista câmeras disponíveis no sistema ──────────────────────
camera-list:
	@echo ""
	@echo "  Cameras detectadas:"
	@for i in 0 1 2 3 4; do \
		$(PYTHON) -c "import cv2; c=cv2.VideoCapture($$i); \
		ok,f=c.read(); \
		print(f'  /dev/video$$i  ->  ' + ('DISPONIVEL' if ok and f is not None else 'nao encontrada')); \
		c.release()" 2>/dev/null; \
	done
	@echo ""

setup: install
