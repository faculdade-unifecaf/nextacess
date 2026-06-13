import os
os.environ.setdefault('QT_QPA_PLATFORM', 'xcb')
os.environ.setdefault('OPENCV_LOG_LEVEL', 'ERROR')  # silencia warns de devices sem captura

import cv2
import requests
import time
import sys
import threading
import numpy as np
import base64
import json
from io import BytesIO
from PIL import Image

try:
    import face_recognition
    FR_AVAILABLE = True
except ImportError:
    print("[AVISO] face_recognition não instalado. Rode: pip install face_recognition")
    FR_AVAILABLE = False

API_BASE   = os.environ.get("NEXTACCESS_API_URL", "http://localhost:3000") + "/api"
# None = auto-detecta (prefere Elgato). Ou force um índice: ex. 4
CAMERA_IDX     = None
CAMERA_PREFIRA = os.environ.get("NEXTACCESS_CAMERA", "elgato").lower()

GREEN  = (0, 220, 80)
RED    = (0, 60, 220)
YELLOW = (0, 200, 220)
WHITE  = (255, 255, 255)
BLACK  = (0, 0, 0)
WIN    = "NextAccess — Estacionamento Facial"

REFRESH_FACES_INTERVAL = 60   # recarrega cadastros a cada 60s
FACE_TOLERANCE         = 0.50  # limiar de similaridade (menor = mais restritivo)
COOLDOWN_SECONDS       = 5    # tempo mínimo entre reconhecimentos do mesmo rosto


# ── Utilitário: baixa foto de uma URL e retorna imagem RGB ───────────────────
def download_foto(url: str):
    try:
        r = requests.get(url, timeout=10)
        if not r.ok:
            return None
        arr = np.frombuffer(r.content, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        return cv2.cvtColor(img, cv2.COLOR_BGR2RGB) if img is not None else None
    except Exception:
        return None


# ── Carregador de cadastros ────────────────────────────────────────────────────
class FaceDatabase:
    def __init__(self):
        self.encodings: list[np.ndarray] = []
        self.user_ids:  list[str]        = []
        self.lock = threading.Lock()
        self._last_refresh = 0

    def refresh(self):
        try:
            r = requests.get(f"{API_BASE}/facial/lista", timeout=5)
            if not r.ok:
                print(f"[FaceDB] Erro ao buscar cadastros: {r.status_code}")
                return
            rows = r.json()
            encs, ids = [], []
            for row in rows:
                uid = row.get("user_id")
                # Processa as duas fotos (normal + proxima) — mais encodings = mais precisão
                for key in ["foto_url_normal", "foto_url_proxima"]:
                    url = row.get(key)
                    if not url:
                        continue
                    try:
                        img_rgb = download_foto(url)
                        if img_rgb is None:
                            continue
                        found = face_recognition.face_encodings(img_rgb)
                        if found:
                            encs.append(found[0])
                            ids.append(uid)
                    except Exception as e:
                        print(f"[FaceDB] Erro ao processar {key} de {uid}: {e}")

            with self.lock:
                self.encodings = encs
                self.user_ids  = ids
            print(f"[FaceDB] {len(encs)} encodings carregados ({len(rows)} usuários).")
        except Exception as e:
            print(f"[FaceDB] Falha na atualização: {e}")
        finally:
            self._last_refresh = time.time()

    def find(self, encoding: np.ndarray) -> str | None:
        with self.lock:
            if not self.encodings:
                return None
            dists   = face_recognition.face_distance(self.encodings, encoding)
            best_i  = int(np.argmin(dists))
            if dists[best_i] <= FACE_TOLERANCE:
                return self.user_ids[best_i]
        return None

    def needs_refresh(self) -> bool:
        return time.time() - self._last_refresh > REFRESH_FACES_INTERVAL


# ── Thread de captura — resiliente a falhas de USB ────────────────────────────
class FrameGrabber(threading.Thread):
    def __init__(self, cap, idx):
        super().__init__(daemon=True)
        self.cap     = cap
        self.idx     = idx
        self.frame   = None
        self.lock    = threading.Lock()
        self.running = True

    def run(self):
        falhas = 0
        while self.running:
            try:
                ret, frame = self.cap.read()
            except Exception:
                ret, frame = False, None

            if ret and frame is not None and frame.size > 0:
                falhas = 0
                with self.lock:
                    self.frame = frame
            else:
                falhas += 1
                if falhas >= 30:
                    print(f"\n[Câmera] Reconectando /dev/video{self.idx}...")
                    try: self.cap.release()
                    except Exception: pass
                    time.sleep(0.5)
                    self.cap = abrir_camera(self.idx)
                    falhas = 0
                else:
                    time.sleep(0.02)

    def latest(self):
        with self.lock:
            return self.frame.copy() if self.frame is not None else None

    def stop(self):
        self.running = False


# ── Utilitários ───────────────────────────────────────────────────────────────
def _nome_camera(i: int) -> str:
    try:
        with open(f"/sys/class/video4linux/video{i}/name") as f:
            return f.read().strip().lower()
    except Exception:
        return ""


def abrir_camera(idx: int):
    """Abre a câmera com backend V4L2 (mais estável no Linux)."""
    cap = cv2.VideoCapture(idx, cv2.CAP_V4L2)
    if not cap.isOpened():
        cap = cv2.VideoCapture(idx)
    return cap


def encontrar_camera(excluir: list[int] = []) -> int:
    print("Detectando câmera para estacionamento...")
    candidatos = []
    for i in range(10):
        if i in excluir:
            continue
        nome = _nome_camera(i)
        cap = cv2.VideoCapture(i, cv2.CAP_V4L2)
        if not cap.isOpened():
            cap.release()
            continue
        ret, frame = cap.read()
        cap.release()
        if ret and frame is not None and frame.size > 0:
            marca = f" [{nome}]" if nome else ""
            print(f"  [OK] /dev/video{i}{marca}")
            candidatos.append((i, nome))
        else:
            print(f"  [--] /dev/video{i} — sem frames úteis")

    if not candidatos:
        return -1

    for i, nome in candidatos:
        if CAMERA_PREFIRA and CAMERA_PREFIRA in nome:
            print(f"  → Usando /dev/video{i} ({nome})")
            return i

    i = candidatos[0][0]
    print(f"  → Usando /dev/video{i}")
    return i


def chamar_api(user_id: str) -> dict:
    try:
        r = requests.post(f"{API_BASE}/facial/reconhecer", json={"user_id": user_id}, timeout=4)
        return r.json()
    except Exception as e:
        return {"autorizado": False, "motivo": f"Erro API: {e}"}


def draw_overlay(frame, result: dict):
    h, w = frame.shape[:2]
    acao = result.get("acao", "")

    if not result.get("autorizado"):
        cor   = RED
        label = "ACESSO NEGADO"
    elif acao == "entrada":
        cor   = GREEN
        label = "ENTRADA LIBERADA"
    elif acao == "saida":
        cor   = GREEN
        label = "SAÍDA LIBERADA"
    else:
        cor   = YELLOW
        label = "PAGAMENTO PENDENTE"

    nome   = result.get("nome", "")
    motivo = result.get("motivo", "")
    mens   = "MENSALISTA" if result.get("mensalista") else ""

    cv2.rectangle(frame, (0, h - 90), (w, h), BLACK, -1)
    cv2.rectangle(frame, (0, h - 90), (w, h - 88), cor, -1)
    cv2.putText(frame, label,  (16, h - 56), cv2.FONT_HERSHEY_SIMPLEX, 1.0, cor, 2)
    if nome:
        cv2.putText(frame, nome,   (16, h - 26), cv2.FONT_HERSHEY_SIMPLEX, 0.65, WHITE, 1)
    if mens:
        cv2.putText(frame, mens,   (w - 160, h - 26), cv2.FONT_HERSHEY_SIMPLEX, 0.55, YELLOW, 1)
    if motivo and not nome:
        cv2.putText(frame, motivo, (16, h - 26), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (160, 160, 255), 1)


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    if not FR_AVAILABLE:
        print("[ERRO] Instale: pip install face_recognition pillow")
        sys.exit(1)

    idx = CAMERA_IDX if CAMERA_IDX is not None else encontrar_camera()
    if idx == -1:
        print("\n[ERRO] Nenhuma câmera USB encontrada.")
        sys.exit(1)

    cap = abrir_camera(idx)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)

    real_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    real_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"\nNextAccess Facial — câmera {idx} ativa ({real_w}x{real_h})")

    # Aquece câmera
    for _ in range(20):
        cap.read()

    db = FaceDatabase()
    print("Carregando cadastros faciais...")
    db.refresh()

    grabber = FrameGrabber(cap, idx)
    grabber.start()

    cv2.namedWindow(WIN, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(WIN, 960, 540)

    print("Câmera pronta. Aguardando rostos... Pressione Q para sair.\n")

    last_result    = None
    result_until   = 0
    last_seen: dict[str, float] = {}  # user_id → timestamp
    tick           = 0
    process_every  = 3  # processa a cada N frames (eficiência)

    while True:
        frame = grabber.latest()
        if frame is None:
            time.sleep(0.01)
            continue

        tick += 1

        # Atualiza DB de rostos periodicamente
        if db.needs_refresh():
            threading.Thread(target=db.refresh, daemon=True).start()

        # Processa a cada N frames
        if tick % process_every == 0:
            small = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
            rgb   = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

            locations = face_recognition.face_locations(rgb)
            encodings = face_recognition.face_encodings(rgb, locations)

            for enc, loc in zip(encodings, locations):
                user_id = db.find(enc)
                if not user_id:
                    continue

                # Cooldown por user
                now = time.time()
                if now - last_seen.get(user_id, 0) < COOLDOWN_SECONDS:
                    continue
                last_seen[user_id] = now

                # Desenha bounding box (escala 2x de volta)
                top, right, bottom, left = [v * 2 for v in loc]
                cv2.rectangle(frame, (left, top), (right, bottom), GREEN, 2)

                # Chama API
                result       = chamar_api(user_id)
                last_result  = result
                result_until = now + 4

                acao   = result.get("acao", "?")
                status = "LIBERADO" if result.get("autorizado") else "NEGADO"
                print(f"[Facial] {result.get('nome', user_id)} | {acao} → {status}")

        if last_result and time.time() < result_until:
            draw_overlay(frame, last_result)
        elif time.time() >= result_until:
            last_result = None

        cv2.putText(frame, "NextAccess Estacionamento | Q = sair", (10, 26),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (120, 120, 120), 1)
        cv2.imshow(WIN, frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    grabber.stop()
    try: grabber.cap.release()
    except Exception: pass
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
