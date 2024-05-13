import { createContext } from 'react';

import type { GetterOrLanguageFile } from './shared/types.js';

const TContext = createContext<
  { getterOrLanguageFile: GetterOrLanguageFile | null; suspend: boolean } | undefined
>(undefined);

export default TContext;
