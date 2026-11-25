export interface Quote {
  c: number
  d: number
  dp: number
  h: number
  l: number
  o: number
  pc: number
  t: number
}

export interface CompanyProfile {
  name: string
  ticker: string
  exchange: string
  finnhubIndustry: string
  weburl: string
  logo: string
  marketCapitalization?: number
  shareOutstanding?: number
}

export interface NewsItem {
  category: string
  datetime: number
  headline: string
  id: number
  image: string
  related: string
  source: string
  summary: string
  url: string
}

export interface BasicFinancials {
  metric: Record<string, number>
}
