import once from 'lodash.once';
import { getUserLocales } from 'get-user-locale';

function altLanguageCode(languageCode) {
  return (languageCode.includes('-')
    ? languageCode.split('-')[0]
    : `${languageCode}-${languageCode.toUpperCase()}`
  );
}

function getMatchingSupportedLocale(userLocale, supportedLocales) {
  return supportedLocales.find((el) => (
    // First, try and find exact match
    el === userLocale
    // If not found, try and alter user locale
    || el === altLanguageCode(userLocale)
    // If not found, try and alter supported locale instead
    || altLanguageCode(el) === userLocale
  ));
}

function getMatchingLocaleInternal(supportedLocales) {
  const userLocales = getUserLocales();

  let matchingLocale;

  userLocales.some((userLocale) => {
    matchingLocale = getMatchingSupportedLocale(userLocale, supportedLocales);
    return matchingLocale;
  });

  return matchingLocale;
}

/**
 * Finds a locale which both we support and user prefers.
 *
 * @param {string[]} supportedLocales Supported locales
 */
export const getMatchingLocale = once(getMatchingLocaleInternal);
