function altLanguageCode(languageCode: string) {
  return languageCode.includes('-')
    ? languageCode.split('-')[0]
    : `${languageCode}-${languageCode.toUpperCase()}`;
}

function getMatchingSupportedLocale(userLocale: string, supportedLocales: string[]): string | null {
  return (
    supportedLocales.find(
      (supportedLocale) =>
        // First, try and find an exact match
        supportedLocale === userLocale ||
        // If not found, try and alter the user locale
        supportedLocale === altLanguageCode(userLocale) ||
        // If not found, try and alter the supported locale instead
        altLanguageCode(supportedLocale) === userLocale,
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
