import { resolveSiteUrl } from './site-url';

describe('resolveSiteUrl', () => {
  it('returns a valid HTTPS URL without a trailing slash', () => {
    expect(resolveSiteUrl('  https://example.com/  ').toString()).toBe('https://example.com/');
  });

  it.each([undefined, '', '   ', 'example.com', 'not a url', 'ftp://example.com'])(
    'uses the local fallback for %p',
    (value) => {
      expect(resolveSiteUrl(value).toString()).toBe('http://localhost:3000/');
    },
  );
});
