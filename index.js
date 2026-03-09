import { writeFileSync } from 'fs';

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

async function fetchTrendingCrypto() {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Extract the crypto array from data.data.list
  const cryptoArray = data.data?.list || [];
  
  if (!Array.isArray(cryptoArray)) {
    throw new Error('Could not find crypto array in response');
  }

  const normalizedData = cryptoArray.map(item => ({
    cryptoId: Number(item.cryptoId),
    tokenName: item.tokenName,
    tokenSymbol: item.tokenSymbol,
    priceUsd: Number(item.priceUsd),
    volume24h: Number(item.volume24h),
    pricePercentageChange24h: Number(item.pricePercentageChange24h),
    marketCap: Number(item.marketCap)
  }));

  console.log(`\nExtracted ${normalizedData.length} cryptocurrencies`);
  
  writeFileSync('trending_crypto.json', JSON.stringify(normalizedData, null, 2));
  console.log('Data saved to trending_crypto.json');
  
  return normalizedData;
}

fetchTrendingCrypto().catch(console.error);
