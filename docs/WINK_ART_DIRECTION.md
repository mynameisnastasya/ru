# WINK — дарите это чувство

## Направление

Тёплая редакционная витрина подарков: молочная бумага, естественный свет, припылённый розовый, глубокий бордовый акцент и серебро в предметной съёмке. Сохранён WINK; и действующий русский голос бренда. Georgia для выразительных кириллических заголовков, Inter для интерфейса. Никаких новых шрифтов или UI-зависимостей.

Первый экран переведён из затемнённой фоновой фотографии в ясную двухчастную композицию. В сгенерированном референсе использованы светлая зона текста, крупная антиква, правая фотография получения подарка и прямоугольный CTA. Цены и телефон из визуального референса НЕ переносились: источник бизнес-данных — текущий каталог.

Слои hero: бумага и текст, интерьер с получателем, небольшая открытка-ссылка на сердца поверх границы. Desktop: разный масштаб и наложение. Mobile: самостоятельная вертикальная композиция без перекрывающей текст открытки.

## Механики и источники

- [21st.dev — carousels](https://21st.dev/community/components/s/carousel): навигация миниатюрами для галереи и управляемые пользователем горизонтальные подборки на телефоне. Реализованы собственными компонентами и CSS scroll-snap, без копирования чужого TSX и без autoplay.
- [21st.dev — navigation](https://21st.dev/community/components/s/navigation-menu): компактная адаптивная навигация; на товаре мобильная нижняя навигация уступает место кнопке покупки.
- [Scroll Craft](https://github.com/nateherkai/scroll-craft): независимые планы глубины, сдержанный сдвиг фотографии при естественном скролле, отдельная мобильная композиция, контент остаётся видимым. Нет scroll-jacking, искусственного длинного закрепления или исчезающего hero.

Анимации — CSS transform, небольшой fade только при ручной смене фотографии палитры. Scroll-driven анимации подключаются через @supports; браузеры без поддержки получают полноценную статичную страницу. Reduced motion отключает и анимации, и плавную прокрутку.

## Информационная архитектура

Главная: эмоция → небольшая подборка товаров → четыре вопроса → палитра в интерьере → история дня рождения → получатели → три шага → FAQ.

Карточки товаров: быстрый просмотр состава/цены → детали → галерея → палитра и персонализация → корзина. Быстрый просмотр не добавляет неперсонализированный товар. Фильтры, поиск, избранное, составы, цены, даты и исходные маршруты сохранены.

## Изображения

Сохранены исходные wink-air.webp, wink-birthday.webp, wink-hearts.webp. Добавлены восемь основных и шесть подарочных визуализаций. Основные новые изображения оптимизированы до 1000 px по ширине, WebP q82 (примерно 48–96 КБ); подарки 640×640, q80. Исходные PNG не входят в сайт.

| Файл                      | Назначение                                                       |
| ------------------------- | ---------------------------------------------------------------- |
| campaign-arrival.webp     | Получение подарка, hero, контекст галереи                        |
| wink-message.webp         | Bubble и личная надпись, коллекция MESSAGE                       |
| wink-reveal.webp          | Шар-сюрприз, BABY REVEAL                                         |
| wink-love.webp            | Сердца с латексными шарами, LOVE                                 |
| campaign-for-him.webp     | Редакционная идея для него                                       |
| campaign-kids.webp        | Редакционная идея детского праздника                             |
| palette-milk.webp         | Молочная палитра в пространстве                                  |
| palette-black-chrome.webp | Чёрно-серебряная палитра в пространстве                          |
| gift-\*.webp              | Шесть демо-подарков; точные промпты в WINK_GIFT_IMAGE_PROMPTS.md |

Все изображения маркированы как визуализации/идеи. Это не фотографии выполненных заказов, доказательство наличия или точный предпросмотр конфигурации. Детская и мужская editorial-съёмки содержат вдохновляющие оттенки, не обещают доступность каждого показанного цвета. Реальные выбранные составы и доступные палитры остаются в карточках.

### Брифы ранее подготовленных основных кадров

Ниже нормализованные производственные брифы (не дословная история первоначальных tool-вызовов). Инструмент: встроенный imagegen.

- Arrival: естественная lifestyle-фотография девушки в кремовом комплекте, встречающей две розово-молочные композиции с хромом в светлой квартире. Видимые ленты, грузики, естественная радость, без рекламного текста.
- MESSAGE: светлый интерьер, нежные воздушные фонтаны и прозрачный Bubble с надписью «ДЛЯ ТЕБЯ». Отдельное визуальное лицо коллекции.
- BABY REVEAL: крупный чёрный шар с текстом «МАЛЬЧИК ИЛИ ДЕВОЧКА?», молочные боковые композиции, светлая интерьерная фотография.
- LOVE: два розовых фольгированных сердца и нежные латексные композиции у кровати, мягкий утренний свет.
- For him: интерьерная композиция чёрного, молочного и металлизированных оттенков; редакционная идея, не точная выбранная палитра.
- Kids: ребёнок со спины рядом с пастельной композицией и серебряной цифрой 7; ощущение масштаба и праздника, без идентификации реального ребёнка.

### Точные промпты новых палитр

Оба кадра созданы встроенным imagegen; количество в изображении не используется как источник состава SKU.

#### Молочный

```text
Use case: photorealistic-natural. Asset type: interactive color-palette editorial scene for WINK balloon gifting website. Portrait 4:5 photograph, warm pale plaster apartment wall, pale oak floor, soft morning sunlight from left. Two distinct elegant helium balloon fountains of eight balloons each with fine ivory ribbons gathered to weighted silver pouches on floor, all fully in frame. Palette strictly ONLY creamy ivory, milk white and warm white latex balloons, no chrome balloons, no other color, no numbers, no writing, no people. Restrained stylish real-life interior, one low travertine plinth to far right, calm shadows and natural material detail. Premium editorial photograph with real reflections, not glossy CGI. Show each bouquet full height with air above, balanced composition, subtle analogue warmth. No logos, no watermark, no UI.
```

#### Чёрный + серебро

```text
Use case: photorealistic-natural. Asset type: interactive color-palette editorial scene for WINK balloon gifting website. Portrait 4:5 photograph, warm pale plaster apartment wall, pale oak floor, soft morning sunlight from left. Two distinct elegant helium balloon fountains of eight balloons each with fine ivory ribbons gathered to weighted silver pouches on floor, all fully in frame. Palette strictly ONLY black latex, mirror silver chrome and milk white latex balloons. Absolutely no gold, no pink, no numbers, no writing, no people. Restrained stylish real-life interior, one low travertine plinth to far right, calm shadows and natural material detail. Premium editorial photograph with real reflections, not glossy CGI. Show each bouquet full height with air above, balanced composition, subtle analogue warmth. No logos, no watermark, no UI.
```
