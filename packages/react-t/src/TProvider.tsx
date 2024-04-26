import { useEffect, useState } from 'react';

import TContext from './TContext.js';

import { resolveLanguageFile, resolveLanguageFileSync } from './utils/resolver.js';

import useLocale from './hooks/useLocale.js';

import type { LanguageFile, LanguageFiles } from './shared/types.js';

export type TProviderProps<T extends LanguageFiles> = {
  children: React.ReactNode;
  defaultLocale?: Extract<keyof T, string>;
  languageFiles?: LanguageFiles;
  locale?: Extract<keyof T, string>;
};

export default function TProvider<T extends LanguageFiles>({
  children,
  defaultLocale,
  languageFiles,
  locale: propsLocale,
}: TProviderProps<T>) {
  const supportedLocales = languageFiles ? Object.keys(languageFiles) : [];

  const locale = useLocale({ defaultLocale, propsLocale, supportedLocales });

  const getterOrLanguageFile =
    languageFiles && locale && languageFiles[locale] ? languageFiles[locale] : undefined;

  const [languageFile, setLanguageFile] = useState<LanguageFile | undefined>(
    resolveLanguageFileSync(getterOrLanguageFile),
  );

  useEffect(() => {
    resolveLanguageFile(getterOrLanguageFile).then(setLanguageFile);
  }, [getterOrLanguageFile]);

  return <TContext.Provider value={{ languageFile }}>{children}</TContext.Provider>;
}
