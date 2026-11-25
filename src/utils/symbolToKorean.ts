/** 종목 심볼 → 네이버 뉴스 검색어 매핑 */
export const SYMBOL_TO_KOREAN: Record<string, string> = {
  AAPL: '애플',
  MSFT: '마이크로소프트',
  GOOGL: '구글',
  AMZN: '아마존',
  NVDA: '엔비디아',
  META: '메타',
  TSLA: '테슬라',
  KO: '코카콜라',
};

export function getSearchQuery(symbol: string, companyName?: string): string {
  return SYMBOL_TO_KOREAN[symbol] ?? companyName ?? `${symbol} 주가`;
}
