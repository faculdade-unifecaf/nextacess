import cv2
import requests
import time
from pyzbar.pyzbar import decode

API_URL    = "http://localhost:3000/api/iot/validar"
CAMERA_IDX = 0   # Altere para 1 ou 2 se a Elgato USB não abrir aqui

# Cores BGR
GREEN  = (0, 220, 80)
RED    = (0, 60, 220)
WHITE  = (255, 255, 255)
BLACK  = (0, 0, 0)

last_token   = None
last_result  = None
result_until = 0   # exibe o resultado por 3s após leitura


def validar(token: str) -> dict:
    try:
        r = requests.post(API_URL, json={"token": token}, timeout=3)
        return r.json()
    except Exception as e:
        return {"autorizado": False, "motivo": str(e)}


def draw_overlay(frame, result: dict):
    h, w = frame.shape[:2]
    cor   = GREEN if result.get("autorizado") else RED
    label = "ACESSO LIBERADO" if result.get("autorizado") else "ACESSO NEGADO"
    nome  = result.get("nome", "")
    tipo  = result.get("tipo", "")
    motivo = result.get("motivo", "")

    cv2.rectangle(frame, (0, h - 90), (w, h), BLACK, -1)
    cv2.rectangle(frame, (0, h - 90), (w, h - 88), cor, -1)

    cv2.putText(frame, label, (16, h - 58), cv2.FONT_HERSHEY_SIMPLEX, 1.0, cor, 2)
    if nome:
        cv2.putText(frame, f"{nome}  [{tipo}]", (16, h - 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, WHITE, 1)
    if motivo:
        cv2.putText(frame, motivo, (16, h - 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (160, 160, 255), 1)


def listar_cameras():
    """Detecta quais índices de câmera estão disponíveis."""
    disponiveis = []
    for i in range(6):
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            disponiveis.append(i)
            cap.release()
    return disponiveis


def main():
    print("Câmeras disponíveis:", listar_cameras())
    print(f"Usando índice {CAMERA_IDX}  (altere CAMERA_IDX no script se necessário)\n")

    cap = cv2.VideoCapture(CAMERA_IDX)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    if not cap.isOpened():
        print(f"[ERRO] Não foi possível abrir a câmera {CAMERA_IDX}")
        return

    print("NextAccess — Leitura de QR ativa. Pressione Q para sair.\n")

    global last_token, last_result, result_until

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        qrs = decode(frame)
        for qr in qrs:
            token = qr.data.decode("utf-8")

            # Desenha bounding box ao redor do QR
            pts = qr.polygon
            if len(pts) == 4:
                for i in range(4):
                    cv2.line(frame, tuple(pts[i]), tuple(pts[(i+1) % 4]), (76, 158, 255), 2)

            # Só valida se for um token novo
            if token != last_token:
                last_token   = token
                print(f"QR lido: {token[:40]}...")
                last_result  = validar(token)
                result_until = time.time() + 3
                status = "OK" if last_result.get("autorizado") else "NEGADO"
                print(f"  → {status} | {last_result}\n")

        # Exibe overlay enquanto dentro do tempo
        if last_result and time.time() < result_until:
            draw_overlay(frame, last_result)
        else:
            if time.time() >= result_until:
                last_token  = None   # libera para ler o mesmo QR novamente
                last_result = None

        cv2.putText(frame, "NextAccess | Q para sair", (10, 24),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (150, 150, 150), 1)
        cv2.imshow("NextAccess — Leitura QR", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
