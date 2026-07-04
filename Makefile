.PHONY: install playground run test frontend

install:
	python -m pip install -e .

playground:
	uv run adk web app --host 127.0.0.1 --port 18081 --reload_agents

run:
	uv run uvicorn app.fast_api_app:app --host 127.0.0.1 --port 8080

test:
	uv run pytest

frontend:
	python -m http.server 3000 --directory frontend
