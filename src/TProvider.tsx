import React, { createContext, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutationObserver } from '@wojtekmaj/react-hooks';

import { getMatchingLocale } from './utils';

export type LanguageFile = Record<string, string>;

type GetterOrLanguageFile = (() => Promise<LanguageFile>) | (() => LanguageFile) | LanguageFile;

type LanguageFiles = Record<string, GetterOrLanguageFile>;

export const Context = createContext<{ languageFile?: LanguageFile } | undefined>(undefined);

const isBrowser = typeof document !== 'undefined';

function resolveLanguageFileSync(getterOrLanguageFile?: GetterOrLanguageFile) {
  if (getterOrLanguageFile instanceof Function) {
    const promiseOrLanguageFile = getterOrLanguageFile();

    if (promiseOrLanguageFile instanceof Promise) {
      return undefined;
    }

    return promiseOrLanguageFile;
  }

  return getterOrLanguageFile;
}

function resolveLanguageFile(getterOrLanguageFile?: GetterOrLanguageFile) {
  if (getterOrLanguageFile instanceof Function) {
    const promiseOrLanguageFile = getterOrLanguageFile();

    if (promiseOrLanguageFile instanceof Promise) {
      return promiseOrLanguageFile;
    }

    return Promise.resolve(promiseOrLanguageFile);
  }

  return Promise.resolve(getterOrLanguageFile);
}

function getMatchingDocumentLocale(supportedLocales: string[], defaultLocale: string) {
  if (!isBrowser) {
    return undefined;
  }

  const lang = document.documentElement.getAttribute('lang');

  if (!lang || (lang !== defaultLocale && !supportedLocales.includes(lang))) {
    return undefined;
  }

  return lang;
}

const observerConfig = {
  attributeFilter: ['lang'],
  attributes: true,
};

type TProviderProps = {
  children: React.ReactNode;
  defaultLocale: string;
  languageFiles: LanguageFiles;
  locale?: keyof LanguageFiles;
};

export default function TProvider({
  children,
  defaultLocale = 'en-US',
  languageFiles = {},
  locale: localeProps,
}: TProviderProps) {
  const supportedLocales = Object.keys(languageFiles);

  function getLocaleFromDocument() {
    return getMatchingDocumentLocale(supportedLocales, defaultLocale);
  }

  function getLocaleFromUserPreferences() {
    return getMatchingLocale(supportedLocales);
  }

  function getLocaleFromDocumentOrUserPreferences() {
    return (
      localeProps || getLocaleFromDocument() || getLocaleFromUserPreferences() || defaultLocale
    );
  }

  const locale = getLocaleFromDocumentOrUserPreferences();
  const getterOrLanguageFile = languageFiles[locale];
  const [languageFile, setLanguageFile] = useState(resolveLanguageFileSync(getterOrLanguageFile));

  const onLangAttributeChange = useCallback(() => {
    const nextLocale = getLocaleFromDocumentOrUserPreferences();
    resolveLanguageFile(languageFiles[nextLocale]).then(setLanguageFile);
  }, []);

  useEffect(onLangAttributeChange, [onLangAttributeChange]);

  useMutationObserver(
    isBrowser ? document.documentElement : null,
    observerConfig,
    onLangAttributeChange,
  );

  return <Context.Provider value={{ languageFile }}>{children}</Context.Provider>;
}

TProvider.propTypes = {
  children: PropTypes.node,
  defaultLocale: PropTypes.string,
  languageFiles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.func])),
  locale: PropTypes.string,
};
