/**
 * .env 파일에서 환경 변수를 읽습니다.
 * Finnhub: https://finnhub.io/register
 * Naver: https://developers.naver.com/appinfo
 */
import Config from 'react-native-config';

export const FINNHUB_API_KEY = Config.FINNHUB_API_KEY ?? '';
export const NAVER_CLIENT_ID = Config.NAVER_CLIENT_ID ?? '';
export const NAVER_CLIENT_SECRET = Config.NAVER_CLIENT_SECRET ?? '';
