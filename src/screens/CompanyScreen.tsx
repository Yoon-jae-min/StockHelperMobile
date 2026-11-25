import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { BasicFinancials, CompanyProfile, NewsItem, Quote } from '../types';
import { getBasicFinancials, getCandles, getCompanyNews, getCompanyProfile, getQuote } from '../api/finnhub';
import { getNaverNews } from '../api/naver';
import type { NaverNewsItem } from '../types/naver';
import { getSearchQuery } from '../utils/symbolToKorean';
import { LineChart } from 'react-native-gifted-charts';

type Props = NativeStackScreenProps<RootStackParamList, 'Company'>;

interface CandleData {
  t: number[];
  c: number[];
}

export default function CompanyScreen({ route }: Props) {
  const { symbol } = route.params;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [financials, setFinancials] = useState<BasicFinancials | null>(null);
  const [candles, setCandles] = useState<CandleData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [naverNews, setNaverNews] = useState<NaverNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const now = Math.floor(Date.now() / 1000);
        const from = now - 60 * 60 * 24 * 30; // 최근 30일

        const [q, p, f, c, n] = await Promise.all([
          getQuote(symbol).catch(() => null),
          getCompanyProfile(symbol).catch(() => null),
          getBasicFinancials(symbol).catch(() => null),
          getCandles(symbol, 'D', from, now).catch(() => null),
          getCompanyNews(symbol, new Date(from * 1000).toISOString().slice(0, 10), new Date().toISOString().slice(0, 10)).catch(
            () => [],
          ),
        ]);

        if (q) setQuote(q);
        if (p) setProfile(p);
        if (f) setFinancials(f as BasicFinancials);
        if (c && Array.isArray(c.t) && Array.isArray(c.c)) {
          setCandles({ t: c.t, c: c.c });
        }
        if (Array.isArray(n)) setNews(n.slice(0, 10));

        try {
          const query = getSearchQuery(symbol, p?.name);
          const res = await getNaverNews(query, 10);
          setNaverNews(res.items ?? []);
        } catch {
          // 네이버 쪽 에러는 치명적이지 않으므로 무시
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '종목 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [symbol]);

  const chartData = useMemo(() => {
    if (!candles || !Array.isArray(candles.t) || !Array.isArray(candles.c) || candles.t.length === 0) {
      return null;
    }
    const points = candles.t.map((t, idx) => ({
      value: candles.c[idx],
      label: '',
      dataPointText: '',
    }));
    return points;
  }, [candles]);

  const openUrl = (url: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.loadingText}>종목 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 헤더: 기본 정보 */}
      <View style={styles.headerCard}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.companyName}>{profile?.name ?? '회사 정보 없음'}</Text>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.label}>현재가</Text>
            <Text style={styles.price}>
              {quote?.c != null ? `${quote.c.toFixed(2)} USD` : '-'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>전일 대비</Text>
            {quote?.d != null && quote.dp != null ? (
              <Text
                style={[
                  styles.change,
                  quote.d > 0 && styles.changeUp,
                  quote.d < 0 && styles.changeDown,
                ]}
              >
                {quote.d > 0 ? '+' : ''}
                {quote.d.toFixed(2)} ({quote.dp > 0 ? '+' : ''}
                {quote.dp.toFixed(2)}%)
              </Text>
            ) : (
              <Text style={styles.change}>-</Text>
            )}
          </View>
        </View>
        {profile?.weburl ? (
          <TouchableOpacity
            onPress={() => openUrl(profile.weburl)}
            style={styles.linkButton}
            activeOpacity={0.8}
          >
            <Text style={styles.linkButtonText}>공식 웹사이트 열기</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 차트 */}
      {chartData && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>최근 1개월 차트</Text>
          <LineChart
            data={chartData}
            thickness={2}
            color="#0f766e"
            hideRules
            hideYAxisText
            hideDataPoints
            initialSpacing={0}
            endSpacing={0}
            yAxisColor="transparent"
            xAxisColor="transparent"
            areaChart
            startFillColor="rgba(15,118,110,0.25)"
            endFillColor="rgba(15,118,110,0.02)"
            startOpacity={0.6}
            endOpacity={0.1}
          />
        </View>
      )}

      {/* 재무 요약 (간단 지표 몇 개만 노출) */}
      {financials?.metric && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>핵심 재무 지표</Text>
          <View style={styles.metricsGrid}>
            <MetricRow
              label="PER (TTM)"
              value={financials.metric.peTTM}
              formatter={v => v.toFixed(2)}
            />
            <MetricRow
              label="EPS (TTM)"
              value={financials.metric.epsTTM}
              formatter={v => v.toFixed(2)}
            />
            <MetricRow
              label="ROE"
              value={financials.metric.roeTTM}
              formatter={v => `${v.toFixed(2)}%`}
            />
            <MetricRow
              label="배당수익률"
              value={financials.metric.dividendYieldIndicatedAnnual}
              formatter={v => `${(v * 100).toFixed(2)}%`}
            />
          </View>
        </View>
      )}

      {/* 피너브 뉴스 */}
      {news.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>글로벌 뉴스</Text>
          {news.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.newsItem}
              onPress={() => openUrl(item.url)}
              activeOpacity={0.8}
            >
              <Text style={styles.newsSource}>{item.source}</Text>
              <Text style={styles.newsHeadline} numberOfLines={2}>
                {item.headline}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 네이버 뉴스 */}
      {naverNews.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>국내 뉴스 (네이버)</Text>
          {naverNews.map((item, idx) => (
            <TouchableOpacity
              key={`${item.link}-${idx}`}
              style={styles.newsItem}
              onPress={() => openUrl(item.link || item.originallink)}
              activeOpacity={0.8}
            >
              <Text style={styles.newsSource}>네이버 뉴스</Text>
              <Text style={styles.newsHeadline} numberOfLines={2}>
                {item.title.replace(/<[^>]*>/g, '')}
              </Text>
              <Text style={styles.newsDescription} numberOfLines={2}>
                {item.description.replace(/<[^>]*>/g, '')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

interface MetricRowProps {
  label: string;
  value?: number;
  formatter?: (v: number) => string;
}

function MetricRow({ label, value, formatter }: MetricRowProps) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>
        {typeof value === 'number'
          ? formatter
            ? formatter(value)
            : value.toString()
          : '-'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748b',
  },
  errorBox: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#b91c1c',
  },
  headerCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    marginBottom: 12,
  },
  symbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  companyName: {
    marginTop: 4,
    fontSize: 14,
    color: '#cbd5f5',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
  },
  price: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
  },
  change: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  changeUp: {
    color: '#22c55e',
  },
  changeDown: {
    color: '#f97316',
  },
  linkButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  linkButtonText: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '500',
  },
  card: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  metricsGrid: {
    marginTop: 4,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0f172a',
  },
  newsItem: {
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  newsSource: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 2,
  },
  newsHeadline: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  newsDescription: {
    marginTop: 2,
    fontSize: 13,
    color: '#6b7280',
  },
});

