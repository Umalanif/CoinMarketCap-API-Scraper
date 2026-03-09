import { writeFileSync, readFileSync, existsSync } from 'fs';
import { config } from 'dotenv';
import cron from 'node-cron';

config();

const url = 'https://api.coinmarketcap.com/data-api/v3/unified-trending/listing';

const headers = {
  'platform': 'web',
  'content-type': 'application/json',
  'referer': 'https://coinmarketcap.com/'
};

const body = {
  interval: '24h',
  pageNum: 1,
  category: '',
  pageSize: 100
};

const DATA_FILE = 'trending_crypto.json';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_USER_ID;

function readOldData() {
  if (!existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const content = readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function findNewCoins(oldData, newData) {
  // Создаём Set идентификаторов: используем cryptoId, если есть, иначе только tokenSymbol
  const oldIdentifiers = new Set(
    oldData.map(coin => coin.cryptoId !== null ? `${coin.cryptoId}:${coin.tokenSymbol}` : coin.tokenSymbol)
  );

  return newData.filter(coin => {
    const identifier = coin.cryptoId !== null ? `${coin.cryptoId}:${coin.tokenSymbol}` : coin.tokenSymbol;
    return !oldIdentifiers.has(identifier);
  });
}

async function sendTelegramAlert(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram credentials not configured');
    return;
  }

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Telegram API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  console.log('Alert sent to Telegram');
}

async function fetchTrendingCrypto() {
  const oldData = readOldData();

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  const cryptoArray = data.data?.list || [];

  if (!Array.isArray(cryptoArray)) {
    throw new Error('Could not find crypto array in response');
  }

  const normalizedData = cryptoArray.map(item => ({
    cryptoId: item.cryptoId ? Number(item.cryptoId) : null,
    tokenName: item.tokenName,
    tokenSymbol: item.tokenSymbol,
    priceUsd: Number(item.priceUsd),
    volume24h: Number(item.volume24h),
    pricePercentageChange24h: Number(item.pricePercentageChange24h),
    marketCap: Number(item.marketCap)
  }));

  console.log(`\nExtracted ${normalizedData.length} cryptocurrencies`);

  const newCoins = findNewCoins(oldData, normalizedData);

  if (newCoins.length > 0) {
    const tickers = newCoins.map(coin => coin.tokenSymbol).join(', ');
    const message = `🚀 Новые монеты в тренде: [${tickers}]`;
    console.log(`\n${message}`);
    await sendTelegramAlert(message);
  } else {
    console.log('\nНет новых монет в тренде');
  }

  writeFileSync(DATA_FILE, JSON.stringify(normalizedData, null, 2));
  console.log('Data saved to trending_crypto.json');

  return normalizedData;
}

// Запуск каждую 1 минуту (для тестирования)
cron.schedule('* * * * *', async () => {
  console.log(`\n[${new Date().toLocaleTimeString()}] Запуск проверки трендов...`);
  try {
    await fetchTrendingCrypto();
  } catch (error) {
    console.error('Критическая ошибка при проверке:', error.message);
  }
});

console.log('Монитор крипто-трендов запущен. Ожидание расписания...');
