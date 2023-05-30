import { createContext } from 'react';

import type { LanguageFile } from './types';

const TContext = createContext<{ languageFile: LanguageFile | undefined } | undefined>(undefined);

export default TContext;
