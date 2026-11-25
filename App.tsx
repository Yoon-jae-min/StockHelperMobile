/**
 * 주식 헬퍼 - 시세·뉴스·재무로 매매 판단을 돕는 모바일 앱
 */
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
