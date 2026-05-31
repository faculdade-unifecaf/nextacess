import os
os.environ.setdefault('QT_QPA_PLATFORM', 'xcb')

import cv2
import requests
import time
import sys
import threading
from pyzbar.pyzbar import decode as pyzbar_decode

API_URL    = os.environ.get("NEXTACCESS_API_URL", "http://localhost:3000") + "/api/iot/validar"
CAMERA_IDX = None

GREEN = (0, 220, 80)
RED   = (0, 60, 220)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
WIN   = "NextAccess — Leitura QR"


# ── Thread de captura — garante display fluido ────────────────────────────────
class FrameGrabber(threading.Thread):
    def __init__(self, cap):
        super().__init__(daemon=True)
        self.cap   = cap
        self.frame = None
        self.lock  = threading.Lock()

    def run(self):
        while True:
            ret, frame = self.cap.read()
            if ret and frame is not None:
                with self.lock:
                    self.frame = frame

    def latest(self):
        with self.lock:
            return self.frame.copy() if self.frame is not None else None


# ── Utilitários ───────────────────────────────────────────────────────────────
def encontrar_camera() -> int:
    print("Detectando câmeras disponíveis...")
    for i in range(8):
        cap = cv2.VideoCapture(i)
        if not cap.isOpened():
            cap.release()
            continue
        ret, frame = cap.read()
        cap.release()
        if ret and frame is not None and frame.size > 0:
            print(f"  [OK] /dev/video{i} — usando esta")
            return i
        print(f"  [--] /dev/video{i} — sem frames úteis")
    return -1


def aquecer_camera(cap, n=20):
    print("  Aquecendo câmera...", end="", flush=True)
    for _ in range(n):
        cap.read()
    print(" ok")


def validar(token: str) -> dict:
    try:
        r = requests.post(API_URL, json={"token": token}, timeout=3)
        return r.json()
    except Exception as e:
        return {"autorizado": False, "motivo": f"Erro API: {e}"}


def draw_overlay(frame, result: dict):
    h, w   = frame.shape[:2]
    cor    = GREEN if result.get("autorizado") else RED
    label  = "ACESSO LIBERADO" if result.get("autorizado") else "ACESSO NEGADO"
    nome   = result.get("nome", "")
    motivo = result.get("motivo", "")

    cv2.rectangle(frame, (0, h - 90), (w, h), BLACK, -1)
    cv2.rectangle(frame, (0, h - 90), (w, h - 88), cor, -1)
    cv2.putText(frame, label, (16, h - 56), cv2.FONT_HERSHEY_SIMPLEX, 1.0, cor, 2)
    if nome:
        cv2.putText(frame, nome, (16, h - 26), cv2.FONT_HERSHEY_SIMPLEX, 0.65, WHITE, 1)
    if motivo and not nome:
        cv2.putText(frame, motivo, (16, h - 26), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (160, 160, 255), 1)


_qr_detector = cv2.QRCodeDetector()

def tentar_ler_qr(frame):
    """Tenta ler QR com múltiplos preprocessamentos."""
    gray     = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blur     = cv2.GaussianBlur(gray, (0, 0), 3)
    unsharp  = cv2.addWeighted(gray, 2.0, blur, -1.0, 0)   # realça bordas
    thresh   = cv2.adaptiveThreshold(unsharp, 255,
                   cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 15, 4)

    for variante in [gray, unsharp, thresh, cv2.bitwise_not(thresh)]:
        data, bbox, _ = _qr_detector.detectAndDecode(variante)
        if data:
            pts = bbox[0].astype(int).tolist() if bbox is not None else []
            return [(data, pts)]
        res = pyzbar_decode(variante)
        if res:
            return [(r.data.decode("utf-8"), [(p.x, p.y) for p in r.polygon])
                    for r in res]
    return []


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    idx = CAMERA_IDX if CAMERA_IDX is not None else encontrar_camera()
    if idx == -1:
        print("\n[ERRO] Nenhuma câmera encontrada.")
        sys.exit(1)

    cap = cv2.VideoCapture(idx)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)   # 640x480 foca melhor a curta distância
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    cap.set(cv2.CAP_PROP_AUTOFOCUS, 1)       # ativa autofoco

    real_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    real_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"\nNextAccess — câmera {idx} ativa ({real_w}x{real_h})")

    aquecer_camera(cap)

    grabber = FrameGrabber(cap)
    grabber.start()

    cv2.namedWindow(WIN, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(WIN, 960, 540)

    print("Aponte o QR Code para a câmera. Pressione Q para sair.\n")

    last_token   = None
    last_result  = None
    result_until = 0
    tick         = 0

    while True:
        frame = grabber.latest()
        if frame is None:
            time.sleep(0.01)
            continue

        tick += 1

        # decodifica a cada 4 frames — equilíbrio entre fluidez e detecção
        if tick % 4 == 0:
            for token, pts in tentar_ler_qr(frame):
                if len(pts) == 4:
                    for i in range(4):
                        p1 = tuple(pts[i])   if isinstance(pts[i], (list, tuple)) else (pts[i][0], pts[i][1])
                        p2 = tuple(pts[(i+1)%4]) if isinstance(pts[(i+1)%4], (list, tuple)) else (pts[(i+1)%4][0], pts[(i+1)%4][1])
                        cv2.line(frame, p1, p2, (76, 158, 255), 2)

                if token != last_token:
                    last_token   = token
                    print(f"QR detectado: {token[:60]}")
                    last_result  = validar(token)
                    result_until = time.time() + 3
                    status = "LIBERADO" if last_result.get("autorizado") else "NEGADO"
                    print(f"  → {status} | {last_result}\n")

        if last_result and time.time() < result_until:
            draw_overlay(frame, last_result)
        else:
            if time.time() >= result_until:
                last_token  = None
                last_result = None

        cv2.putText(frame, "NextAccess | Q para sair", (10, 26),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (120, 120, 120), 1)
        cv2.imshow(WIN, frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
