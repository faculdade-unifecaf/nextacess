import os
os.environ.setdefault('QT_QPA_PLATFORM', 'xcb')
import cv2
from pyzbar.pyzbar import decode as pyzbar_decode

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
for _ in range(20): cap.read()

det = cv2.QRCodeDetector()
cv2.namedWindow("DIAGNOSTICO — Pressione ESPACO para capturar / Q para sair", cv2.WINDOW_NORMAL)
cv2.resizeWindow("DIAGNOSTICO — Pressione ESPACO para capturar / Q para sair", 960, 540)

print("Aponte o QR Code para a câmera e pressione ESPAÇO para analisar.")

while True:
    ret, frame = cap.read()
    if not ret: continue
    cv2.imshow("DIAGNOSTICO — Pressione ESPACO para capturar / Q para sair", frame)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):
        break

    if key == ord(' '):
        path = "/tmp/captura_qr.png"
        cv2.imwrite(path, frame)
        print(f"\nFrame salvo: {path} ({frame.shape[1]}x{frame.shape[0]})")

        gray     = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        ajustado = cv2.convertScaleAbs(gray, alpha=1.5, beta=-30)

        print("\n--- Tentando detectar QR ---")

        data, bbox, _ = det.detectAndDecode(frame)
        print(f"OpenCV (BGR):  {repr(data) if data else 'nada'}")

        data, bbox, _ = det.detectAndDecode(gray)
        print(f"OpenCV (gray): {repr(data) if data else 'nada'}")

        data, bbox, _ = det.detectAndDecode(ajustado)
        print(f"OpenCV (contrast): {repr(data) if data else 'nada'}")

        res = pyzbar_decode(gray)
        print(f"pyzbar (gray): {[r.data.decode() for r in res] or 'nada'}")

        res = pyzbar_decode(ajustado)
        print(f"pyzbar (contrast): {[r.data.decode() for r in res] or 'nada'}")

        # salva também versão em cinza para inspecao
        cv2.imwrite("/tmp/captura_gray.png", gray)
        cv2.imwrite("/tmp/captura_ajustado.png", ajustado)
        print("\nSalvos: /tmp/captura_qr.png  /tmp/captura_gray.png  /tmp/captura_ajustado.png")

cap.release()
cv2.destroyAllWindows()
