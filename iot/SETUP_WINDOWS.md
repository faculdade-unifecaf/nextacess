# IoT — Setup no Windows

Guia para rodar `camera.py` (leitura QR) e `facial_parking.py` (reconhecimento facial) no Windows.

---

## Pré-requisitos obrigatórios

### 1. Python 3.10 ou 3.11 (não use 3.12+)
- Baixe em: https://www.python.org/downloads/
- Durante a instalação, marque **"Add Python to PATH"**
- Verifique: `python --version`

> `face_recognition` depende do `dlib`, que ainda tem problemas de compilação no Python 3.12+. Use 3.10 ou 3.11.

### 2. CMake
- Baixe em: https://cmake.org/download/ (Windows x64 Installer)
- Durante a instalação, marque **"Add CMake to the system PATH"**
- Verifique: `cmake --version`

### 3. Visual Studio Build Tools (compilador C++)
- Baixe em: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- Selecione a workload: **"Desenvolvimento para desktop com C++"**
- Tamanho: ~3-5 GB — necessário para compilar o `dlib`

---

## Instalação das dependências

Abra o **PowerShell** ou **Prompt de Comando** dentro da pasta `iot/`:

```bash
# Crie um ambiente virtual
python -m venv venv

# Ative
venv\Scripts\activate

# Atualize o pip
python -m pip install --upgrade pip

# Instale numpy e wheel antes do dlib
pip install numpy wheel

# Instale o dlib (pode demorar 5-15 minutos compilando)
pip install dlib

# Instale o restante
pip install opencv-python pyzbar requests pillow

# Instale face_recognition e seus modelos
pip install face_recognition
pip install git+https://github.com/ageitgey/face_recognition_models
```

---

## Problema comum: pyzbar não encontra a DLL do zbar

Se aparecer erro `zbar DLL not found` ao rodar `camera.py`:

1. Baixe `zbar-x64.zip` em: https://github.com/NaturalHistoryMuseum/scarab-obelisk/releases
   — ou baixe o instalador em: https://sourceforge.net/projects/zbar/
2. Copie `libzbar-64.dll` para `C:\Windows\System32\`
3. Reinicie o terminal

Alternativa — instalar via conda:
```bash
conda install -c conda-forge zbar
```

---

## Problema comum: dlib falha na compilação

Se `pip install dlib` travar ou falhar, use uma wheel pré-compilada:

1. Acesse: https://github.com/jloh02/dlib/releases
2. Baixe a `.whl` compatível com sua versão do Python (ex: `dlib-19.24.1-cp311-cp311-win_amd64.whl`)
3. Instale:
```bash
pip install caminho\para\dlib-19.24.1-cp311-cp311-win_amd64.whl
```

---

## Câmeras no Windows

### Câmera integrada (notebook)
Geralmente detectada automaticamente como `/dev/video0` equivalente (índice `0`).

### Câmera USB
Plugue antes de rodar. O script já auto-detecta — testa os índices 0 a 7.

Se quiser forçar um índice específico, edite no topo do arquivo:
```python
# camera.py ou facial_parking.py
CAMERA_IDX = 1   # force a câmera USB, por exemplo
```

### Verificar câmeras disponíveis (script de teste rápido)
```python
import cv2
for i in range(5):
    cap = cv2.VideoCapture(i)
    if cap.isOpened():
        print(f"Câmera {i}: OK")
        cap.release()
    else:
        print(f"Câmera {i}: não encontrada")
```
Salve como `teste_cameras.py` e rode com `python teste_cameras.py`.

---

## Variável de ambiente

Antes de rodar, defina a URL do back-end:

```bash
# PowerShell
$env:NEXTACCESS_API_URL = "http://SEU_IP_LOCAL:3000"

# CMD
set NEXTACCESS_API_URL=http://SEU_IP_LOCAL:3000
```

Ou crie um arquivo `.env` na pasta `iot/` com:
```
NEXTACCESS_API_URL=http://192.168.x.x:3000
```

---

## Rodar

```bash
# Ative o venv antes (sempre)
venv\Scripts\activate

# Leitura QR (catraca)
python camera.py

# Reconhecimento facial (estacionamento)
python facial_parking.py
```

---

## Resumo do tempo estimado

| Etapa | Tempo |
|---|---|
| Python + CMake | 5 min |
| Visual Studio Build Tools | 15-30 min (download + install) |
| `pip install dlib` (compilando) | 5-15 min |
| Resto das dependências | 2-3 min |
| **Total** | ~30-60 min |

> Se usar a wheel pré-compilada do dlib, o total cai para ~15 minutos.
