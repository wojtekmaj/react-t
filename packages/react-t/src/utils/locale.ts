function altLanguageCode(languageCode: string) {
  return languageCode.includes('-')
    ? languageCode.split('-')[0]
    : `${languageCode}-${languageCode.toUpperCase()}`;
}

function getMatchingSupportedLocale(userLocale: string, supportedLocales: string[]): string | null {
  return (
    supportedLocales.find(
      (el) =>
        // First, try and find exact match
        el === userLocale ||
        // If not found, try and alter user locale
        el === altLanguageCode(userLocale) ||
        // If not found, try and alter supported locale instead
        altLanguageCode(el) === userLocale,
    ) || null
  );
}

export function getMatchingLocale(locales: string[], supportedLocales: string[]): string | null {
  for (const locale of locales) {
    const matchingLocale = getMatchingSupportedLocale(locale, supportedLocales);

    if (matchingLocale) {
      return matchingLocale;
    }
  }

  return null;
}
