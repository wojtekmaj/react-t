import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { useMutationObserver } from '@wojtekmaj/react-hooks';

import { getMatchingLocale } from './utils';

export const Context = createContext();

const isBrowser = typeof window !== 'undefined' && 'document' in window;

function resolveLanguageFile(getterOrLanguageFile) {
  if (!(getterOrLanguageFile instanceof Function)) {
    return Promise.resolve(getterOrLanguageFile);
  }

  const promiseOrLanguageFile = getterOrLanguageFile();

  if (!(promiseOrLanguageFile instanceof Promise)) {
    return Promise.resolve(promiseOrLanguageFile);
  }

  return promiseOrLanguageFile;
}

function getMatchingDocumentLocale(supportedLocales, defaultLocale) {
  if (!isBrowser) {
    return undefined;
  }

  const lang = document.documentElement.getAttribute('lang');

  if (lang !== defaultLocale && !supportedLocales.includes(lang)) {
    return undefined;
  }

  return lang;
}

const observerConfig = {
  attributeFilter: ['lang'],
  attributes: true,
};

export default function TProvider({
  children,
  defaultLocale = 'en-US',
  languageFiles = {},
  locale: localeProps,
}) {
  const supportedLocales = Object.keys(languageFiles);

  function getLocaleFromDocument() {
    return getMatchingDocumentLocale(supportedLocales, defaultLocale);
  }

  function getLocaleFromUserPreferences() {
    return getMatchingLocale(supportedLocales);
  }

  function getLocaleFromDocumentOrUserPreferences() {
    return (
      localeProps
      || getLocaleFromDocument()
      || getLocaleFromUserPreferences()
      || defaultLocale
    );
  }

  const [languageFile, setLanguageFile] = useState();

  const onLangAttributeChange = useCallback(() => {
    const locale = getLocaleFromDocumentOrUserPreferences();
    resolveLanguageFile(languageFiles[locale]).then(setLanguageFile);
  }, []);

  useEffect(onLangAttributeChange, []);

  useMutationObserver(isBrowser && document.documentElement, observerConfig, onLangAttributeChange);

  return (
    <Context.Provider value={{ languageFile }}>
      {children}
    </Context.Provider>
  );
}

TProvider.propTypes = {
  children: PropTypes.node,
  defaultLocale: PropTypes.string,
  languageFiles: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  ),
  locale: PropTypes.string,
};
