import { useContext, useState, useEffect } from 'react';

import { Context } from './TProvider';

function getTranslatedString(string, languageFiles, locale) {
  return languageFiles[locale]()
    .then((languageFile) => {
      if (typeof languageFile[string] === 'string') {
        return languageFile[string];
      }

      return string;
    })
    .catch(() => {
      // eslint-disable-next-line no-console
      console.error(`Unable to load locale: ${locale}`);
      return string;
    });
}

function applyVars(rawString, args) {
  if (!args) {
    return rawString;
  }

  let finalString = rawString;
  Object.entries(args).forEach(([key, value]) => {
    finalString = finalString.replace(`{${key}}`, value);
  });

  return finalString;
}

export default function useTranslation(string, args = {}) {
  const context = useContext(Context);

  if (!context) {
    throw new Error('Unable to find TProvider context. Did you wrap your app in <TProvider />?');
  }

  const { locale, defaultLocale, languageFiles } = context;

  const [translatedString, setTranslatedString] = useState(null);

  useEffect(() => {
    function applyVarsAndSet(str) {
      const stringWithArgs = applyVars(str, args);
      setTranslatedString(stringWithArgs);
    }

    if (locale === defaultLocale) {
      applyVarsAndSet(string);
    } else {
      getTranslatedString(string, languageFiles, locale).then(applyVarsAndSet);
    }
  }, [string, ...Object.values(args), locale]);

  return translatedString;
}
