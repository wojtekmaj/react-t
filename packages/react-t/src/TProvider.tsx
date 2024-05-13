import { useRef } from 'react';

import TContext from './TContext.js';

import useLocale from './hooks/useLocale.js';

import type { LanguageFiles } from './shared/types.js';

export type TProviderProps<T extends LanguageFiles> = {
  children: React.ReactNode;
  defaultLocale?: Extract<keyof T, string>;
  languageFiles?: LanguageFiles;
  locale?: Extract<keyof T, string>;
  suspend?: boolean;
};

export default function TProvider<T extends LanguageFiles>({
  children,
  defaultLocale,
  languageFiles,
  locale: propsLocale,
  suspend = false,
}: TProviderProps<T>) {
  const prevSuspend = useRef(suspend);

  if (prevSuspend.current !== suspend) {
    throw new Error('Changing the `suspend` prop of `TProvider` between renders is not supported.');
  }

  const supportedLocales = languageFiles ? Object.keys(languageFiles) : [];

  const locale = useLocale({ defaultLocale, propsLocale, supportedLocales });

  const getterOrLanguageFile =
    (languageFiles && locale && languageFiles[locale] ? languageFiles[locale] : null) || null;

  return (
    <TContext.Provider value={{ getterOrLanguageFile, suspend }}>{children}</TContext.Provider>
  );
}
