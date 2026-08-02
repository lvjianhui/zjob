FROM python:3.12-slim

WORKDIR /app

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 强制刷新构建缓存（修改 ARG 值即可触发 COPY 重建）
ARG CACHEBUST=1
RUN echo "cachebust: ${CACHEBUST}"

# 复制应用代码
COPY . .

# 构建阶段验证文件结构
RUN echo "=== Build: /app contents ===" && ls -la /app/ && echo "=== Build: /app/app contents ===" && ls -la /app/app/

EXPOSE 8000

CMD ["sh", "-c", "cd /app && export PYTHONPATH=/app && echo '=== Runtime: Starting uvicorn ===' && exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]
