import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { Quote } from '../types';
import { getQuote, getMarketNews } from '../api/finnhub';
import { getNaverNews } from '../api/naver';
import { getSearchQuery } from '../utils/symbolToKorean';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const WATCH_LIST = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA'] as const;

interface DashboardItem {
  symbol: string;
  quote: Quote | null;
}

export default function DashboardScreen({ navigation }: Props) {
  const [items, setItems] = useState<DashboardItem[]>(
    WATCH_LIST.map(symbol => ({ symbol, quote: null })),
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headline, setHeadline] = useState<string | null>(null);

  async function loadData() {
    setError(null);
    try {
      const quotes = await Promise.all(
        WATCH_LIST.map(symbol =>
          getQuote(symbol).catch(() => null),
        ),
      );
      setItems(
        WATCH_LIST.map((symbol, idx) => ({
          symbol,
          quote: quotes[idx],
        })),
      );

      // 메인 뉴스 1건만 가져와서 상단에 표시
      try {
        const marketNews = await getMarketNews('general');
        if (Array.isArray(marketNews) && marketNews.length > 0) {
          setHeadline(marketNews[0].headline);
        }
      } catch {
        // 무시 (핵심 기능은 아님)
      }

      // 네이버 뉴스 호출로 키가 정상인지도 가볍게 체크
      try {
        const query = getSearchQuery('AAPL', '애플');
        const res = await getNaverNews(query, 1);
        if (!res || !Array.isArray(res.items)) {
          // 형태만 확인
        }
      } catch {
        // 네이버 쪽은 없어도 메인 기능은 동작하므로 무시
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderItem = ({ item }: { item: DashboardItem }) => {
    const quote = item.quote;
    const price = quote?.c ?? null;
    const change = quote?.d ?? null;
    const changePct = quote?.dp ?? null;

    const isUp = typeof change === 'number' && change > 0;
    const isDown = typeof change === 'number' && change < 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Company', { symbol: item.symbol })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          {price != null ? (
            <Text style={styles.price}>{price.toFixed(2)} USD</Text>
          ) : (
            <Text style={styles.pricePlaceholder}>-</Text>
          )}
        </View>
        <View style={styles.cardFooter}>
          {change != null && changePct != null ? (
            <Text
              style={[
                styles.change,
                isUp && styles.changeUp,
                isDown && styles.changeDown,
              ]}
            >
              {change > 0 ? '+' : ''}
              {change.toFixed(2)} ({changePct > 0 ? '+' : ''}
              {changePct.toFixed(2)}%)
            </Text>
          ) : (
            <Text style={styles.change}>변동 없음</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.loadingText}>시세를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {headline && (
        <View style={styles.banner}>
          <Text style={styles.bannerLabel}>오늘의 시장 뉴스</Text>
          <Text style={styles.bannerText} numberOfLines={2}>
            {headline}
          </Text>
        </View>
      )}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={item => item.symbol}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
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
  banner: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#ecfeff',
  },
  bannerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 14,
    color: '#0f172a',
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
  listContent: {
    paddingBottom: 16,
  },
  card: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  pricePlaceholder: {
    fontSize: 16,
    fontWeight: '500',
    color: '#cbd5f5',
  },
  cardFooter: {
    marginTop: 6,
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  changeUp: {
    color: '#16a34a',
  },
  changeDown: {
    color: '#dc2626',
  },
});

