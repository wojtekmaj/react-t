import { describe, expect, it } from 'vitest';

import { getMatchingLocale } from './locale.js';

describe('getMatchingLocale()', () => {
  it.each`
    locales               | supportedLocales      | expectedResult
    ${['pl', 'en']}       | ${['pl', 'en']}       | ${'pl'}
    ${['pl', 'en']}       | ${['en', 'pl']}       | ${'pl'}
    ${['pl-PL', 'en']}    | ${['pl', 'en']}       | ${'pl'}
    ${['de', 'en']}       | ${['pl', 'en']}       | ${'en'}
    ${['de-DE', 'en']}    | ${['pl', 'en']}       | ${'en'}
    ${['en-US', 'pl']}    | ${['pl', 'en']}       | ${'en'}
    ${['en-US', 'pl-PL']} | ${['pl', 'en']}       | ${'en'}
    ${['pl', 'en']}       | ${['pl-PL', 'en-US']} | ${'pl-PL'}
    ${['pl', 'en']}       | ${['en-US', 'pl-PL']} | ${'pl-PL'}
    ${['pl-PL', 'en']}    | ${['pl-PL', 'en-US']} | ${'pl-PL'}
    ${['de', 'en']}       | ${['pl-PL', 'en-US']} | ${'en-US'}
    ${['de-DE', 'en']}    | ${['pl-PL', 'en-US']} | ${'en-US'}
    ${['en-US', 'pl']}    | ${['pl-PL', 'en-US']} | ${'en-US'}
    ${['en-US', 'pl-PL']} | ${['pl-PL', 'en-US']} | ${'en-US'}
  `(
    'returns $expectedResult for locales = $locales and supportedLocales = $supportedLocales',
    ({ locales, supportedLocales, expectedResult }) => {
      const result = getMatchingLocale(locales, supportedLocales);

      expect(result).toBe(expectedResult);
    },
  );
});
