# Hackaton service

Сервис объявлений о наборе команд и откликов аудиовизитками. По умолчанию
работает на порту `8084`; в составе проекта доступен через gateway.

## Основные маршруты

- `GET /api/v1/recruitments` — открытые объявления (публично).
- `GET /api/v1/recruitments/{id}` — открытое объявление (публично).
- `GET /api/v1/recruitments/mine` — объявления текущего пользователя.
- `POST /api/v1/recruitments` — создать черновик.
- `PUT /api/v1/recruitments/{id}` — изменить своё объявление.
- `POST /api/v1/recruitments/{id}/publish|close|archive` — сменить состояние.
- `POST /api/v1/recruitments/{id}/applications` — откликнуться опубликованной визиткой.
- `GET /api/v1/recruitments/{id}/applications` — отклики владельцу объявления.
- `GET /api/v1/applications/mine` — собственные отклики.
- `PATCH /api/v1/applications/{id}/status` — принять или отклонить кандидата.
- `POST /api/v1/applications/{id}/withdraw` — отозвать свой отклик.
- `GET /api/v1/recommendations/recruitments` — получить рекомендации по всем визиткам пользователя.

Swagger UI при прямом запуске: `http://localhost:8084/swagger-ui.html`.
