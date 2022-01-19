import { useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';

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

export default function useTranslation(string, args) {
  const context = useContext(Context);

  invariant(context, 'Unable to find TProvider context. Did you wrap your app in <TProvider />?');

  const { languageFile } = context;

  const translatedString = useMemo(() => {
    const rawTranslatedString = getTranslatedString(languageFile, string);
    const stringWithArgs = applyVars(rawTranslatedString, args);

    return stringWithArgs;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageFile, string, JSON.stringify(args)]);

  return translatedString;
}
