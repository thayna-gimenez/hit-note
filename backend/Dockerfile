# backend/Dockerfile

# Use uma imagem oficial do Python
FROM python:3.10-slim

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie o arquivo de dependências e instale
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copie o restante do código do backend para o contêiner
COPY . .

# Expõe a porta que o uvicorn usará
EXPOSE 8000

# O comando para iniciar o servidor
# Nota: Usamos 0.0.0.0 para ser acessível de fora do contêiner
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]