import { createContext } from 'react';

import type { LanguageFiles } from './shared/types.js';

const TContext = createContext<
  | {
      languageFiles: LanguageFiles | undefined;
      locale: string | null;
      suspend: boolean;
    }
  | undefined
>(undefined);

export default TContext;
