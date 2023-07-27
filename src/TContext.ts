import { createContext } from 'react';

import type { LanguageFile } from './shared/types.js';

const TContext = createContext<{ languageFile: LanguageFile | undefined } | undefined>(undefined);

export default TContext;
