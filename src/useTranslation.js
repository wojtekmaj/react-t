import { useContext, useState, useEffect } from 'react';

import { Context } from './TProvider';

function getTranslatedString(languageFile, string) {
  if (languageFile && typeof languageFile[string] === 'string') {
    return languageFile[string];
  }

  return string;
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

  const { languageFile } = context;

  const [translatedString, setTranslatedString] = useState(
    languageFile ? null : applyVars(string, args),
  );

  useEffect(() => {
    const rawTranslatedString = getTranslatedString(languageFile, string);
    const stringWithArgs = applyVars(rawTranslatedString, args);

    setTranslatedString(stringWithArgs);
  }, [languageFile, string, ...Object.values(args)]);

  return translatedString;
}
