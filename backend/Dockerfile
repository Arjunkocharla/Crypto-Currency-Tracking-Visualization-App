# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching (from backend folder)
COPY backend/requirements-core.txt .

# Install Python dependencies
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements-core.txt

# Copy backend application code
COPY backend/ .

# Expose port (Railway sets PORT env var automatically)
EXPOSE ${PORT:-8085}

# Run the application
CMD ["python", "app.py"]

