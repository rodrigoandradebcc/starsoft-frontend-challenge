const defaultApiBaseUrl = 'https://api-challenge.starsoft.games/api/v1';

export const env = {
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL || defaultApiBaseUrl).replace(/\/$/, ''),
} as const;
