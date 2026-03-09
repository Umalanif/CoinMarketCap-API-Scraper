# CoinMarketCap Trending Crypto Monitor

Скрипт мониторит трендовые криптовалюты на CoinMarketCap и отправляет уведомления в Telegram о новых монетах в тренде.

## Возможности

- 🔄 Автоматический запуск проверки по расписанию (cron)
- 🚀 Уведомления о новых монетах в тренде
- 📊 Сравнение с предыдущими данными для выявления новинок
- 💾 Сохранение состояния в JSON-файл
- 🔒 Защита от падений сети (try/catch в cron)

## Требования

- Node.js v18+ (нативный `fetch`)

## Установка

```bash
cd coinmarketcap-api-scraper
npm install
```

## Настройка

1. Скопируйте `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Отредактируйте `.env` и укажите ваши данные:
   - `TELEGRAM_BOT_TOKEN` — токен бота от @BotFather
   - `TELEGRAM_USER_ID` — ваш Chat ID (куда отправлять уведомления)

## Запуск

```bash
npm start
```

Или напрямую:

```bash
node index.js
```

Скрипт работает в фоновом режиме и выполняет проверку **каждую минуту**.

## Изменение расписания

Откройте `index.js` и измените cron-выражение:

```javascript
// Каждую минуту (для тестирования)
cron.schedule('* * * * *', async () => { ... });

// Каждый час в 00 минут
cron.schedule('0 * * * *', async () => { ... });

// Каждый день в 9:00
cron.schedule('0 9 * * *', async () => { ... });
```

### Cron-формат

```
* * * * *
│ │ │ │ │
│ │ │ │ └─ День недели (0-7)
│ │ │ └─── Месяц (1-12)
│ │ └───── День месяца (1-31)
│ └─────── Час (0-23)
└───────── Минута (0-59)
```

## Выходные данные

Скрипт создаёт файл `trending_crypto.json` со списком трендовых криптовалют.

### Структура данных

```json
[
  {
    "cryptoId": 1,
    "tokenName": "Bitcoin",
    "tokenSymbol": "BTC",
    "priceUsd": 68447.57,
    "volume24h": 50459512063.55,
    "pricePercentageChange24h": 2.35,
    "marketCap": 1368953852441.41
  }
]
```

### Поля

| Поле | Описание |
|------|----------|
| `cryptoId` | Уникальный ID криптовалюты |
| `tokenName` | Название (Bitcoin, Ethereum...) |
| `tokenSymbol` | Тикер (BTC, ETH...) |
| `priceUsd` | Цена в долларах |
| `volume24h` | Объём торгов за 24 часа |
| `pricePercentageChange24h` | Изменение цены за 24 часа (%) |
| `marketCap` | Рыночная капитализация |

## Как это работает

1. При запуске читает `trending_crypto.json` (если есть)
2. Делает POST-запрос к CoinMarketCap API
3. Сравнивает новые данные со старыми по `cryptoId` + `tokenSymbol`
4. Если находит новые монеты → отправляет уведомление в Telegram
5. Обновляет `trending_crypto.json` свежими данными

## API Endpoint

- **URL:** `https://api.coinmarketcap.com/data-api/v3/unified-trending/listing`
- **Method:** `POST`
- **Headers:**
  - `platform: web`
  - `content-type: application/json`
  - `referer: https://coinmarketcap.com/`

### Тело запроса

```json
{
  "interval": "24h",
  "pageNum": 1,
  "category": "",
  "pageSize": 100
}
```

## Зависимости

- `dotenv` — загрузка переменных окружения из `.env`
- `node-cron` — планировщик задач

## Лицензия

ISC
