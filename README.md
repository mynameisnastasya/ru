# Threads Autopilot — Control Center

Рабочая панель управления Threads-автоматизацией через `n8n`.

## Быстрый старт

Открой setup-мастер:

https://mynameisnastasya.github.io/ru/setup.html

Он проведёт по импорту workflow, credentials, Production Webhook URL и сразу проверит связь с n8n.

Готовый workflow:

`n8n/threads-autopilot-controller.json`

## Что умеет панель

- проверить соединение с n8n;
- запустить генерацию поста;
- принять черновик из n8n и отредактировать его;
- опубликовать текущий черновик после подтверждения;
- запустить обработку replies;
- запросить аналитику;
- запустить полный цикл;
- включать `autoPublish`, `autoReplies` и `dryRun`;
- показывать метрики и ссылку на опубликованный пост;
- хранить локальный журнал запусков.

## Безопасность

Threads/OpenAI токены в сайт вставлять нельзя. Они должны храниться в n8n Credentials.

Если используется отдельный токен защиты controller webhook, его можно сохранить в setup-мастере или настройках панели. Он хранится только в localStorage браузера.

## Контракт controller webhook

Панель делает `POST` на один n8n Webhook:

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

Поддерживаемые `action`:

- `health`
- `generate_post`
- `publish_post`
- `sync_replies`
- `run_analytics`
- `run_full_cycle`

## Рекомендуемый первый тест

1. Импортировать `n8n/threads-autopilot-controller.json`.
2. Назначить OpenAI и Threads credentials.
3. Активировать workflow.
4. В setup-мастере вставить Production Webhook URL.
5. Нажать **Сохранить и проверить**.
6. Открыть основную панель.
7. Оставить `Dry run = ON`.
8. Нажать **Сгенерировать**.
9. Только после успешного теста отключать Dry run и пробовать публикацию.

Сайт:

https://mynameisnastasya.github.io/ru/
