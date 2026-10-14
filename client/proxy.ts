import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    '/(en|hi|as|bn|brx|doi|gu|kn|ks|kok|mai|ml|mni|mr|ne|or|pa|sa|sat|sd|ta|te|ur)/:path*',
  ],
};

