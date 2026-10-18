# audio-business-card
Веб-инструмент для создания аудио-визитки студента - для хакатона "Время IT". 

## Frontend

React-приложение находится в каталоге `frontend`. Инструкции по запуску и
архитектуре описаны в `frontend/README.md`.

## Обновление существующей базы визиток

При обновлении с версии, где громкость голоса была ограничена 100%, примените
миграцию для `card_db`. Hibernate `ddl-auto: update` не заменяет уже созданное
ограничение `card_settings_voice_volume_check`:

```bash
docker compose exec -T card-db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' \
  < card-service/db/migrations/2026-10-18-voice-volume-200.sql
```
