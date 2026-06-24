import Constants from 'expo-constants';
import { Platform } from 'react-native';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const getExpoHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  return hostUri ? hostUri.split(':')[0] : null;
};

const isLocalhostUrl = (value) =>
  value?.includes('://localhost') || value?.includes('://127.0.0.1');

const isLanUrl = (value) =>
  /^https?:\/\/(10\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.)/.test(value || '');

const buildApiUrl = (host) => `http://${host}:8000/api/v1`;

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;
const expoHost = getExpoHost();

const getDevelopmentApiUrl = () => {
  if (Platform.OS === 'android') {
    return buildApiUrl('10.0.2.2');
  }

  if (Constants.isDevice && expoHost) {
    return buildApiUrl(expoHost);
  }

  return buildApiUrl('localhost');
};

const resolvedApiUrl =
  configuredApiUrl && !isLocalhostUrl(configuredApiUrl) && !(__DEV__ && expoHost && isLanUrl(configuredApiUrl))
    ? configuredApiUrl
    : getDevelopmentApiUrl();

export const API_BASE_URL = trimTrailingSlash(
  resolvedApiUrl
);

export const API_HOST = API_BASE_URL.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

export const API_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS) || 15000;
export const ITINERARY_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_ITINERARY_TIMEOUT_MS) || 120000;
