import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET } from '../config';
import type { NaverNewsResponse } from '../types/naver';

const BASE = 'https://openapi.naver.com/v1/search/news.json';

export async function getNaverNews(query: string, display = 10): Promise<NaverNewsResponse> {
  const params = new URLSearchParams({
    query,
    display: String(display),
    sort: 'date',
  });
  const res = await fetch(`${BASE}?${params}`, {
    headers: {
      'X-Naver-Client-Id': NAVER_CLIENT_ID,
      'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
    },
  });
  if (!res.ok) throw new Error('Naver news fetch failed');
  return res.json();
}
