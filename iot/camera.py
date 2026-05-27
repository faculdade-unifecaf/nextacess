import cv2
import requests
import time
import sys
from pyzbar.pyzbar import decode

API_URL    = "http://localhost:3000/api/iot/validar"
CAMERA_IDX = None   # None = auto-detecta; defina um número para forçar (ex: 0, 2)

GREEN = (0, 220, 80)
RED   = (0, 60, 220)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)


def encontrar_camera() -> int:
    """Retorna o índice do primeiro nó V4L2 que entrega frames reais."""
    print("Detectando câmeras disponíveis...")
    for i in range(8):
        cap = cv2.VideoCapture(i, cv2.CAP_V4L2)
        if not cap.isOpened():
            cap.release()
            continue
        ret, frame = cap.read()
        cap.release()
        if ret and frame is not None and frame.size > 0:
            print(f"  [OK] /dev/video{i} — usando esta")
            return i
        else:
            print(f"  [--] /dev/video{i} — abre mas sem frames (nó de metadados)")
    return -1


def validar(token: str) -> dict:
    try:
        r = requests.post(API_URL, json={"token": token}, timeout=3)
        return r.json()
    except Exception as e:
        return {"autorizado": False, "motivo": f"Erro API: {e}"}


def draw_overlay(frame, result: dict):
    h, w = frame.shape[:2]
    cor    = GREEN if result.get("autorizado") else RED
    label  = "ACESSO LIBERADO" if result.get("autorizado") else "ACESSO NEGADO"
    nome   = result.get("nome", "")
    tipo   = result.get("tipo", "")
    motivo = result.get("motivo", "")

    cv2.rectangle(frame, (0, h - 90), (w, h), BLACK, -1)
    cv2.rectangle(frame, (0, h - 90), (w, h - 88), cor, -1)
    cv2.putText(frame, label, (16, h - 56), cv2.FONT_HERSHEY_SIMPLEX, 1.0, cor, 2)
    if nome:
        cv2.putText(frame, f"{nome}  [{tipo}]", (16, h - 26),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, WHITE, 1)
    if motivo and not nome:
        cv2.putText(frame, motivo, (16, h - 26),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (160, 160, 255), 1)


def main():
    idx = CAMERA_IDX if CAMERA_IDX is not None else encontrar_camera()
    if idx == -1:
        print("\n[ERRO] Nenhuma câmera com imagem encontrada.")
        print("Tente definir CAMERA_IDX manualmente (0, 1, 2, 3...)")
        sys.exit(1)

    cap = cv2.VideoCapture(idx, cv2.CAP_V4L2)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)   # evita frame atrasado no buffer

    print(f"\nNextAccess — câmera {idx} ativa.")
    print("Aponte o QR Code para a câmera. Pressione Q para sair.\n")

    last_token   = None
    last_result  = None
    result_until = 0

    while True:
        ret, frame = cap.read()
        if not ret or frame is None:
            print("[AVISO] Frame vazio — verificando câmera...")
            time.sleep(0.1)
            continue

        for qr in decode(frame):
            token = qr.data.decode("utf-8")

            # Bounding box azul ao redor do QR
            pts = qr.polygon
            if len(pts) == 4:
                for i in range(4):
                    cv2.line(frame, tuple(pts[i]), tuple(pts[(i + 1) % 4]),
                             (76, 158, 255), 2)

            if token != last_token:
                last_token   = token
                print(f"QR detectado: {token[:50]}...")
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
        cv2.imshow("NextAccess — Leitura QR", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
