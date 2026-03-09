# CoinMarketCap API Scraper

Скрипт для получения списка трендовых криптовалют с CoinMarketCap через неофициальный API.

## Требования

- Node.js v24+ (нативный `fetch`)
- Никаких сторонних зависимостей

## Установка

```bash
cd coinmarketcap-api-scraper
npm install
```

## Использование

```bash
npm start
```

Или напрямую:

```bash
node index.js
```

## Выходные данные

Скрипт создаёт файл `trending_crypto.json` со списком из 100 трендовых криптовалют.

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

## Параметры запроса

| Параметр | Описание |
|----------|----------|
| `interval` | Временной интервал (24h) |
| `pageNum` | Номер страницы |
| `category` | Категория фильтрации (пусто = все) |
| `pageSize` | Количество записей (макс. 100) |

## Лицензия

ISC
