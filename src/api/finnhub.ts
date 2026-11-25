import { FINNHUB_API_KEY } from '../config';

const BASE = 'https://finnhub.io/api/v1';

function url(path: string, params: Record<string, string> = {}) {
  const q = new URLSearchParams({ ...params, token: FINNHUB_API_KEY });
  return `${BASE}${path}?${q}`;
}

export async function getQuote(symbol: string) {
  const r = await fetch(url('/quote', { symbol }));
  if (!r.ok) throw new Error('Quote fetch failed');
  return r.json();
}

export async function getCompanyProfile(symbol: string) {
  const r = await fetch(url('/stock/profile2', { symbol }));
  if (!r.ok) throw new Error('Profile fetch failed');
  return r.json();
}

export async function getCompanyNews(symbol: string, from: string, to: string) {
  const r = await fetch(url('/company-news', { symbol, from, to }));
  if (!r.ok) throw new Error('Company news fetch failed');
  return r.json();
}

export async function getMarketNews(category: 'general' | 'forex' | 'crypto' | 'merger' = 'general') {
  const r = await fetch(url('/news', { category }));
  if (!r.ok) throw new Error('Market news fetch failed');
  return r.json();
}

export async function getCandles(symbol: string, resolution: string, from: number, to: number) {
  const r = await fetch(url('/stock/candle', {
    symbol,
    resolution,
    from: String(from),
    to: String(to),
  }));
  if (!r.ok) throw new Error('Candles fetch failed');
  const data = await r.json();
  if (data.s === 'no_data') return { o: [], h: [], l: [], c: [], v: [], t: [] };
  return data;
}

export async function getBasicFinancials(symbol: string) {
  const r = await fetch(url('/stock/metric', { symbol, metric: 'all' }));
  if (!r.ok) throw new Error('Basic financials fetch failed');
  return r.json();
}

export async function getRecommendation(symbol: string) {
  const r = await fetch(url('/stock/recommendation', { symbol }));
  if (!r.ok) throw new Error('Recommendation fetch failed');
  return r.json();
}
