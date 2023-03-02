import { describe, expect, it, vi } from 'vitest';
import { getUserLocales } from 'get-user-locale';

import { getMatchingLocale } from './utils';

vi.mock('lodash.once', () => ({ default: (fn: () => void) => fn }));

vi.mock('get-user-locale', () => ({
  getUserLocales: vi.fn(),
}));

const mockedGetUserLocales = vi.mocked(getUserLocales);

describe('getMatchingLocale()', () => {
  it.each`
    userLocales           | supportedLocales      | expectedResult
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
    'returns $expectedResult for userLocales = $userLocales and supportedLocales = $supportedLocales',
    ({ userLocales, supportedLocales, expectedResult }) => {
      mockedGetUserLocales.mockReturnValueOnce(userLocales);

      const result = getMatchingLocale(supportedLocales);

      expect(result).toBe(expectedResult);
    },
  );
});
