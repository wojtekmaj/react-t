import { createContext } from 'react';

import type { LanguageFiles } from './shared/types.js';

type TContextValue = {
  languageFiles: LanguageFiles | undefined;
  locale: string | null;
  suspend: boolean;
};

const TContext: React.Context<TContextValue | undefined> = createContext<TContextValue | undefined>(
  undefined,
);

export default TContext;
