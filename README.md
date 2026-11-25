# 주식 헬퍼 (모바일 앱)

주식 시세, 뉴스, 재무 지표, 가격 차트를 보고 **매수·매도 판단**을 돕는 **Android / iOS** 앱입니다.

## 기능

- **대시보드**: 주요 종목 실시간 시세, 등락률, 시장 뉴스
- **종목 상세** (종목 탭 시): 현재가·등락, 가격 추이 차트, 애널리스트 추천, 재무 지표, 해당 기업 뉴스

## 기술 스택

- **React Native** (Android / iOS)
- **React Navigation** (네이티브 스택)
- **react-native-gifted-charts** (가격 차트)
- **Finnhub API** (시세, 뉴스, 재무, 추천)

## 실행 방법

1. **의존성 설치**
   ```bash
   cd StockHelperMobile
   npm install
   ```

2. **API 키 설정**  
   프로젝트 루트에 `.env` 파일을 만들고 다음을 넣습니다.

   - **Finnhub** (필수): [finnhub.io](https://finnhub.io/register) 회원가입 후 발급
   - **Naver** (한국어 뉴스용, 선택): [developers.naver.com](https://developers.naver.com/appinfo)에서 애플리케이션 등록 후 Client ID, Secret 발급

   ```
   FINNHUB_API_KEY=발급받은_키
   NAVER_CLIENT_ID=발급받은_Client_ID
   NAVER_CLIENT_SECRET=발급받은_Client_Secret
   ```
   (`.env`는 Git에 올라가지 않습니다. Naver 키가 없어도 앱은 동작하며, 한국어 뉴스만 표시되지 않습니다.)
   **키를 바꾼 뒤에는 앱을 다시 빌드해야 합니다.** (`npm run android` 또는 `npm run ios` 재실행)

3. **Android 실행** (에뮬레이터 또는 실제 기기 연결 후)
   ```bash
   npm run android
   ```

4. **iOS 실행** (Mac + Xcode 필요)
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

5. **Metro 번들러** (별도 터미널에서)
   ```bash
   npm start
   ```

## 주의사항

- Finnhub 무료 플랜은 요청 제한이 있으므로 과도한 새로고침은 피하세요.
- 추천·재무·뉴스는 **참고용**이며, 매수·매도 결정은 본인 판단과 책임입니다.
