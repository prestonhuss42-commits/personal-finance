FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "if [ ! -f ./artifacts/cf_model.joblib ]; then python -m ml.src.train; fi; uvicorn app.main:app --app-dir api --host 0.0.0.0 --port ${PORT:-8000}"]
