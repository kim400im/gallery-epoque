import { defineRouting } from 'next-intl/routing';

export const locales = ['ko', 'en'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales: locales,
  defaultLocale: 'ko',
  localePrefix: 'always'
});
