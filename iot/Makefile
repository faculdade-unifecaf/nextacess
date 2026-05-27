VENV = venv
PYTHON = $(VENV)/bin/python

.PHONY: run install setup

run:
	$(PYTHON) camera.py

install:
	python3 -m venv $(VENV)
	$(VENV)/bin/pip install --upgrade pip
	$(VENV)/bin/pip install -r requirements.txt

setup: install
	@echo ""
	@echo "Dependências instaladas. Para rodar: make run"
