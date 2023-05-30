import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutationObserver } from '@wojtekmaj/react-hooks';

import TContext from './TContext';

import { getMatchingLocale } from './utils';

import type {
  Module,
  LanguageFile,
  LanguageFileModule,
  GetterOrLanguageFile,
  LanguageFiles,
} from './types';

const isBrowser = typeof document !== 'undefined';

function resolveModule<T extends object | undefined>(module: Module<T>): T {
  return module && 'default' in module ? module.default : module;
}

function resolveLanguageFileModuleSync(
  getterOrLanguageFile?: GetterOrLanguageFile,
): LanguageFileModule | undefined {
  if (getterOrLanguageFile instanceof Function) {
    const promiseOrLanguageFile = getterOrLanguageFile();

    if (promiseOrLanguageFile instanceof Promise) {
      return undefined;
    }

    return promiseOrLanguageFile;
  }

  return getterOrLanguageFile;
}

function resolveLanguageFileSync(
  getterOrLanguageFile?: GetterOrLanguageFile,
): LanguageFile | undefined {
  return resolveModule(resolveLanguageFileModuleSync(getterOrLanguageFile));
}

function resolveLanguageFileModule(
  getterOrLanguageFile?: GetterOrLanguageFile,
): Promise<LanguageFileModule | undefined> {
  if (getterOrLanguageFile instanceof Function) {
    const promiseOrLanguageFile = getterOrLanguageFile();

    if (promiseOrLanguageFile instanceof Promise) {
      return promiseOrLanguageFile;
    }

    return Promise.resolve(promiseOrLanguageFile);
  }

  return Promise.resolve(getterOrLanguageFile);
}

function resolveLanguageFile(
  getterOrLanguageFile?: GetterOrLanguageFile,
): Promise<LanguageFile | undefined> {
  return resolveLanguageFileModule(getterOrLanguageFile).then(resolveModule);
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

export type TProviderProps = {
  children: React.ReactNode;
  defaultLocale?: string;
  languageFiles?: LanguageFiles;
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

  return <TContext.Provider value={{ languageFile }}>{children}</TContext.Provider>;
}

TProvider.propTypes = {
  children: PropTypes.node,
  defaultLocale: PropTypes.string,
  languageFiles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.func])),
  locale: PropTypes.string,
};
