import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import TContext from './TContext';

import { resolveLanguageFile, resolveLanguageFileSync } from './utils/resolver';

import useLocale from './hooks/useLocale';

import { LanguageFile, LanguageFiles } from './shared/types';

export type TProviderProps<T extends LanguageFiles> = {
  children?: React.ReactNode;
} & (
  | {
      defaultLocale?: never;
      languageFile?: LanguageFile;
      languageFiles?: never;
      locale?: never;
    }
  | {
      defaultLocale?: Extract<keyof T, string>;
      languageFile?: never;
      languageFiles?: LanguageFiles;
      locale?: Extract<keyof T, string>;
    }
);

export default function TProvider<T extends LanguageFiles>({
  children,
  defaultLocale,
  languageFile: propsLanguageFile,
  languageFiles,
  locale: propsLocale,
}: TProviderProps<T>) {
  const supportedLocales = languageFiles ? Object.keys(languageFiles) : [];

  const locale = useLocale({ defaultLocale, propsLocale, supportedLocales });

  const getterOrLanguageFile =
    propsLanguageFile ||
    (languageFiles && locale && languageFiles[locale] ? languageFiles[locale] : undefined);

  const [languageFile, setLanguageFile] = useState<LanguageFile | undefined>(
    resolveLanguageFileSync(getterOrLanguageFile),
  );

  useEffect(() => {
    resolveLanguageFile(getterOrLanguageFile).then(setLanguageFile);
  }, [getterOrLanguageFile]);

  return <TContext.Provider value={{ languageFile }}>{children}</TContext.Provider>;
}

const isLanguageFile = PropTypes.oneOfType([PropTypes.object, PropTypes.func]);

TProvider.propTypes = {
  children: PropTypes.node,
  defaultLocale: PropTypes.string,
  languageFile: isLanguageFile,
  languageFiles: PropTypes.objectOf(isLanguageFile),
  locale: PropTypes.string,
};
