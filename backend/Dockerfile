FROM python:3.11-slim

# Evita criação de arquivos .pyc e garante saída em tempo real
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instala dependências do sistema necessárias para psycopg2 e bcrypt
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libffi-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements e instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia código da aplicação
COPY app ./app

# Copia .env (opcional)
COPY .env .env

# Expõe porta da aplicação
EXPOSE 8080

# Comando de inicialização
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "2"]
