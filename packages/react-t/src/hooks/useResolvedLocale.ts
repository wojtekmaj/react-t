import { getUserLocales } from 'get-user-locale';

import useDocumentLocale from './useDocumentLocale.js';

import { getMatchingLocale } from '../utils/locale.js';

export default function useResolvedLocale({
  defaultLocale,
  propsLocale,
  supportedLocales,
}: {
  defaultLocale?: string;
  propsLocale?: string | null;
  supportedLocales: string[];
}): string | null {
  const documentLocale = useDocumentLocale();

  const allSupportedLocales = defaultLocale
    ? [defaultLocale, ...supportedLocales]
    : supportedLocales;

  if (propsLocale) {
    const matchingPropsLocale = getMatchingLocale([propsLocale], allSupportedLocales);

    if (matchingPropsLocale) {
      return matchingPropsLocale;
    }
  }

  if (documentLocale) {
    const matchingDocumentLocale = getMatchingLocale([documentLocale], allSupportedLocales);

    if (matchingDocumentLocale) {
      return matchingDocumentLocale;
    }
  }

  const userLocales = getUserLocales();
  const matchingUserLocale = getMatchingLocale(userLocales, allSupportedLocales);

  if (matchingUserLocale) {
    return matchingUserLocale;
  }

  return defaultLocale || null;
}
