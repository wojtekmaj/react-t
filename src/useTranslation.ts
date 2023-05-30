import { useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';

import TContext from './TContext';

import type { LanguageFile } from './types';

type Args = Record<string, string>;

function getTranslatedString(
  languageFile: LanguageFile | undefined,
  string: string,
): string | undefined {
  if (languageFile && typeof languageFile[string] === 'string') {
    return languageFile[string];
  }

  return string;
}

function applyVars(rawString?: string, args?: Args): string | undefined {
  if (!rawString || !args) {
    return rawString;
  }

  let finalString = rawString;
  Object.entries(args).forEach(([key, value]) => {
    finalString = finalString.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });

  return finalString;
}

export default function useTranslation(string?: string, args?: Args): string | undefined {
  const context = useContext(TContext);

  invariant(context, 'Unable to find TProvider context. Did you wrap your app in <TProvider />?');

  const { languageFile } = context;

  const translatedString = useMemo(() => {
    if (!string) {
      return string;
    }

    const rawTranslatedString = getTranslatedString(languageFile, string);
    const stringWithArgs = applyVars(rawTranslatedString, args);

    return stringWithArgs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageFile, string, JSON.stringify(args)]);

  return translatedString;
}
