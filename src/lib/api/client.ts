import { env } from '@/lib/config/env';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const CATALOG_REVALIDATE_SECONDS = 300;

interface ApiFetchOptions extends RequestInit {
  revalidate?: number;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { revalidate = CATALOG_REVALIDATE_SECONDS, ...init } = options;
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    next: { revalidate },
    headers: { Accept: 'application/json', ...init.headers },
  });
  if (!response.ok) {
    let message = `A API respondeu com o status ${response.status}.`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {}
    throw new ApiError(response.status, message);
  }
  return (await response.json()) as T;
}
