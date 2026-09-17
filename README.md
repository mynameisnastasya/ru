# Threads Autopilot — Control Center

Рабочая панель управления Threads-автоматизацией через `n8n` + OpenAI + официальный Threads API.

Сайт: `https://mynameisnastasya.github.io/ru/`

## Что уже есть

- проверка соединения с n8n;
- генерация поста через OpenAI;
- редактирование черновика в панели;
- публикация текста в Threads после подтверждения;
- поиск replies у последних постов;
- AI-классификация replies: `reply / skip / human`;
- автоматические ответы, если включены `Auto replies` и выключен `Dry run`;
- аналитика аккаунта Threads;
- полный контент-цикл: генерация → при разрешении публикация → метрики;
- локальный журнал запусков;
- безопасный `Dry run` включён по умолчанию.

## Готовый n8n workflow

Импортируй в n8n файл:

`n8n/threads-autopilot-controller.json`

Workflow содержит один controller webhook и маршрутизирует команды из сайта:

- `health`
- `generate_post`
- `publish_post`
- `sync_replies`
- `run_analytics`
- `run_full_cycle`

## Настройка credentials в n8n

### 1. OpenAI

Создай credential типа **Header Auth**:

- Header Name: `Authorization`
- Header Value: `Bearer YOUR_OPENAI_API_KEY`

Выбери его во всех HTTP Request nodes, название которых начинается с `OpenAI`.

### 2. Threads

Создай второй credential типа **Header Auth**:

- Header Name: `Authorization`
- Header Value: `Bearer YOUR_THREADS_ACCESS_TOKEN`

Выбери его во всех HTTP Request nodes, название которых начинается с `Threads` или `Full Cycle · Publish / Post Details / Account Insights`.

Для используемых возможностей Threads-токену нужны соответствующие permissions, включая публикацию, чтение/управление replies и insights.

### 3. Защита controller webhook — рекомендуется

В самом `Dashboard Webhook` можно включить Header Auth и создать отдельный credential:

- Header Name: `Authorization`
- Header Value: `Bearer СЛУЧАЙНЫЙ_ДЛИННЫЙ_ТОКЕН_ПАНЕЛИ`

Это **не** OpenAI key и **не** Threads token.

Тот же токен вставь в сайте: **Настройки → Токен панели**.

### 4. Активируй workflow

После импорта и назначения credentials:

1. Activate workflow.
2. Открой `Dashboard Webhook`.
3. Скопируй **Production URL**.
4. Открой сайт → **Настройки**.
5. Вставь Production URL.
6. Нажми **Сохранить и проверить**.

Webhook уже настроен на CORS origin:

`https://mynameisnastasya.github.io`

## Безопасный первый запуск

Оставь `Dry run` включённым.

1. Нажми **Проверить связь**.
2. Введи тему и нажми **Сгенерировать**.
3. Проверь текст.
4. Нажми **Опубликовать** — при `Dry run` реальной публикации не будет.
5. Нажми **Replies** — модель покажет решения, но не отправит ответы.
6. Нажми **Аналитика**.

Когда всё проверено, выключи `Dry run`.

- Обычная кнопка **Опубликовать** начнёт реально публиковать текущий черновик.
- Для `Полный цикл` дополнительно включи `Auto publish`.
- Для автоматических ответов включи `Auto replies`.
- Один ручной sync ограничен максимум 10 автоматически отправляемыми replies.

## Контракт dashboard → n8n

Панель делает `POST` на один controller webhook:

```json
{
  "action": "generate_post",
  "source": "threads-autopilot-dashboard",
  "timestamp": "2026-09-18T00:00:00.000Z",
  "account": "my_threads",
  "options": {
    "autoPublish": false,
    "autoReplies": false,
    "dryRun": true
  },
  "payload": {
    "topic": "тема поста",
    "draft": "текущий черновик"
  }
}
```

## Формат ответа n8n → dashboard

Черновик:

```json
{
  "ok": true,
  "draft": "Текст нового поста"
}
```

После публикации:

```json
{
  "ok": true,
  "post_id": "...",
  "post_url": "https://www.threads.net/@user/post/..."
}
```

Метрики:

```json
{
  "ok": true,
  "metrics": {
    "published": 3,
    "replies": 17,
    "resolved": "82%",
    "engagement": 41
  }
}
```

## Где хранятся секреты

GitHub Pages содержит только интерфейс. OpenAI API key и Threads access token должны находиться в **n8n Credentials** и никогда не должны попадать в `index.html`, README, localStorage или публичный GitHub.
