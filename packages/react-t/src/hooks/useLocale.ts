import { getUserLocales } from 'get-user-locale';

import { getMatchingLocale } from '../utils/locale.js';

import useDocumentLocale from './useDocumentLocale.js';

export default function useLocale({
  defaultLocale,
  propsLocale,
  supportedLocales,
}: {
  defaultLocale?: string;
  propsLocale?: string;
  supportedLocales: string[];
}): string | null {
  const documentLocale = useDocumentLocale();

  if (propsLocale) {
    const matchingPropsLocale = getMatchingLocale([propsLocale], supportedLocales);

    if (matchingPropsLocale) {
      return matchingPropsLocale;
    }
  }

  if (documentLocale) {
    const matchingDocumentLocale = getMatchingLocale([documentLocale], supportedLocales);

    if (matchingDocumentLocale) {
      return matchingDocumentLocale;
    }
  }

  const userLocales = getUserLocales();
  const matchingUserLocale = getMatchingLocale(userLocales, supportedLocales);

  if (matchingUserLocale) {
    return matchingUserLocale;
  }

  return defaultLocale || null;
}
