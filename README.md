# Threads Autopilot — Control Center

Рабочая панель управления Threads-автоматизацией через `n8n`.

Сайт опубликован через GitHub Pages. Сам GitHub Pages не хранит секреты и не вызывает Threads/OpenAI напрямую: все чувствительные credentials и бизнес-логика должны жить в `n8n`.

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

## Подключение

Открой сайт → **Настройки** → вставь production URL одного `Webhook` node из n8n.

Threads/OpenAI токены в сайт вставлять нельзя. Они должны храниться в n8n Credentials.

Если n8n находится на другом домене, webhook должен разрешать CORS для:

`https://mynameisnastasya.github.io`

## Контракт запроса

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

Поддерживаемые `action`:

- `health`
- `generate_post`
- `publish_post`
- `sync_replies`
- `run_analytics`
- `run_full_cycle`

## Формат ответа

Минимальный успешный ответ:

```json
{
  "ok": true,
  "message": "Готово"
}
```

Для генерации панель автоматически подхватит `draft` или `text`:

```json
{
  "ok": true,
  "draft": "Текст нового поста"
}
```

После публикации можно вернуть ссылку:

```json
{
  "ok": true,
  "post_url": "https://www.threads.net/@user/post/..."
}
```

Метрики можно вернуть так:

```json
{
  "ok": true,
  "metrics": {
    "published": 3,
    "replies": 17,
    "resolved": "82%",
    "engagement": "4.6x"
  }
}
```

## Рекомендуемая схема n8n

`Webhook (POST)` → `Switch` по `{{$json.action}}` → нужная ветка → `Respond to Webhook`.

Для реальной автоматизации ветки должны использовать n8n Credentials для OpenAI/LLM и Threads API. Расписания публикаций и автоответов лучше держать отдельными workflow с `Schedule Trigger`, а controller webhook использовать для ручного запуска из этой панели.
