import React, {
  createContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';

import { getMatchingLocale } from './utils';

export const Context = createContext();

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
  const lang = document.documentElement.getAttribute('lang');

  if (lang !== defaultLocale && !supportedLocales.includes(lang)) {
    return undefined;
  }

  return lang;
}

export default function TProvider({ children, defaultLocale = 'en-US', languageFiles = {} }) {
  const supportedLocales = Object.keys(languageFiles);

  function getLocaleFromDocument() {
    return getMatchingDocumentLocale(supportedLocales, defaultLocale);
  }

  function getLocaleFromUserPreferences() {
    return getMatchingLocale(supportedLocales);
  }

  function getLocaleFromDocumentOrUserPreferences() {
    return getLocaleFromDocument() || getLocaleFromUserPreferences() || defaultLocale;
  }

  const observer = useRef();
  const [languageFile, setLanguageFile] = useState();

  function onLangAttributeChange() {
    const locale = getLocaleFromDocumentOrUserPreferences();
    resolveLanguageFile(languageFiles[locale]).then(setLanguageFile);
  }

  useEffect(() => {
    onLangAttributeChange();
    observer.current = new MutationObserver(onLangAttributeChange);
    observer.current.observe(
      document.documentElement,
      {
        attributeFilter: ['lang'],
        attributes: true,
      },
    );

    return () => observer.current.disconnect();
  }, []);

  return (
    <Context.Provider value={{ languageFile }}>
      {children}
    </Context.Provider>
  );
}

TProvider.propTypes = {
  children: PropTypes.node,
  defaultLocale: PropTypes.string,
  languageFiles: PropTypes.objectOf(PropTypes.func),
};
