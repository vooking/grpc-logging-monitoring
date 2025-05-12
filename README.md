# Logging & Monitoring gRPC Service

## Описание системы
Сервис для приема, хранения и анализа логов с использованием gRPC. Позволяет:
- Отправлять логи (SendLog)
- Запрашивать логи по фильтрам (QueryLogs)
- Получать логи в реальном времени (StreamLogs)

**Сценарии использования**:
- Централизованное логирование микросервисов
- Мониторинг ошибок в реальном времени
- Анализ истории событий системы

## Установка и запуск

### Предварительные требования
- Node.js v16+
- NPM

### 1. Установка зависимостей
```bash
npm install
```

### 2. Запуск компонентов

### В разных терминалах выполните:
- Сервер gRPC: 
```bash
node server.js
```
- REST прокси: 
```bash
node proxy.js
```
- Next.js клиент:
```bash
npm run dev
```

### 3. Примеры запросов

### Отправка лога (SendLog) 

- Запрос:

```bash
curl -X POST http://localhost:4000/send \
  -H "Content-Type: application/json" \
  -d '{
    "service": "auth",
    "level": "ERROR",
    "message": "Invalid credentials",
    "timestamp": 1234567890
  }'
```

- Ответ:

```bash
{"status":"ok"}
```

### Запрос логов (QueryLogs)

- Запрос:

```bash
curl -X POST http://localhost:4000/query \
  -H "Content-Type: application/json" \
  -d '{"service": "auth"}'
```

- Ответ:

```bash
[
  {
    "service": "auth",
    "level": "ERROR",
    "message": "Invalid credentials",
    "timestamp": 1234567890
  }
]
```

### Потоковый прием логов (StreamLogs)

- Запрос:

```bash
curl -N http://localhost:4000/stream?level=ERROR
```

- Ответ:

```bash
data: {"service":"auth","level":"ERROR","message":"Invalid credentials","timestamp":1234567890}
```