import { getUserLocales } from 'get-user-locale';

import useDocumentLocale from './useDocumentLocale.js';

import { getMatchingLocale } from '../utils/locale.js';

export default function useLocale({
  defaultLocale,
  propsLocale,
  supportedLocales,
}: {
  defaultLocale?: string;
  propsLocale?: string | null;
  supportedLocales: string[];
}): string | null {
  const documentLocale = useDocumentLocale();

  let supportedLocalesWithDefault = supportedLocales;
  if (defaultLocale) {
    supportedLocalesWithDefault = [...supportedLocales, defaultLocale];
  }

  if (propsLocale) {
    const matchingPropsLocale = getMatchingLocale([propsLocale], supportedLocalesWithDefault);

    if (matchingPropsLocale) {
      return matchingPropsLocale;
    }
  }

  if (documentLocale) {
    const matchingDocumentLocale = getMatchingLocale([documentLocale], supportedLocalesWithDefault);

    if (matchingDocumentLocale) {
      return matchingDocumentLocale;
    }
  }

  const userLocales = getUserLocales();
  const matchingUserLocale = getMatchingLocale(userLocales, supportedLocalesWithDefault);

  if (matchingUserLocale) {
    return matchingUserLocale;
  }

  return defaultLocale || null;
}
