# Multi-stage Dockerfile for TWOEM Website

# Frontend Build Stage
FROM node:20-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY frontend/ .
RUN yarn build

# Backend Stage
FROM python:3.11-slim as backend
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy frontend build
COPY --from=frontend-build /app/frontend/build ./static

# Expose port
EXPOSE 8000

# Start command
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]