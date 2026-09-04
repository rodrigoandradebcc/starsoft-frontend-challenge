export const ALLOWED_IMAGE_HOSTS = ['softstar.s3.amazonaws.com'] as const;

export function isAllowedImageUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.includes(url.hostname as never);
}
