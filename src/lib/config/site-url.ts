const DEFAULT_SITE_URL = new URL('http://localhost:3000');

export function resolveSiteUrl(value = process.env.NEXT_PUBLIC_SITE_URL): URL {
  try {
    const url = new URL(value?.trim() || DEFAULT_SITE_URL);
    return ['http:', 'https:'].includes(url.protocol) ? url : new URL(DEFAULT_SITE_URL);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function getSiteUrl(): string {
  return resolveSiteUrl().toString().replace(/\/$/, '');
}
