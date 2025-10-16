# Membangun sebuah stage untuk menginstal dependensi
FROM python:3.9-slim AS builder

WORKDIR /app

# Meng-install dependensi di virtual environment
COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Stage akhir untuk menjalankan aplikasi
FROM python:3.9-slim

WORKDIR /app

# Meng-copy virtual environment dari stage builder
COPY --from=builder /opt/venv /opt/venv

# Meng-copy kode aplikasi
COPY . .

# Menetapkan PATH untuk menggunakan virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Membuat user non-root
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 80

CMD ["python", "app.py"]