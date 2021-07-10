import React, { useContext } from 'react';

import { Context } from './TProvider';

function getTranslatedString(languageFile, string) {
  if (languageFile && typeof languageFile[string] === 'string') {
    return languageFile[string];
  }

  return string;
}

const pattern = /\{[^}]*\}/g;

function applyVars(rawString, args) {
  if (!rawString || !args) {
    return rawString;
  }

  const splitString = rawString.split(pattern);

  if (splitString.length <= 1) {
    return rawString;
  }

  const matches = rawString.match(pattern);

  const stringWithArgs = splitString.reduce((arr, element, index) => (matches[index] ? [
    ...arr,
    element,
    matches[index],
  ] : [...arr, element]), []);

  Object.entries(args).forEach(([key, value]) => {
    const indexOf = stringWithArgs.indexOf(`{${key}}`);
    if (indexOf !== -1) {
      stringWithArgs[indexOf] = (
        React.isValidElement(value)
          ? React.cloneElement(value, { key })
          : value
      );
    }
  });

  return stringWithArgs;
}

export default function useTranslation(string, args = {}) {
  const context = useContext(Context);

  if (!context) {
    throw new Error('Unable to find TProvider context. Did you wrap your app in <TProvider />?');
  }

  const { languageFile } = context;

  const translatedString = (() => {
    const rawTranslatedString = getTranslatedString(languageFile, string);
    const stringWithArgs = applyVars(rawTranslatedString, args);

    return stringWithArgs;
  })();

  return translatedString;
}
