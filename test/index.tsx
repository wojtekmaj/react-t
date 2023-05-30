import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TProvider } from '@wojtekmaj/react-t/src';
import { languageFiles } from './i18n';

import Test from './Test';

createRoot(document.getElementById('react-root') as HTMLDivElement).render(
  <StrictMode>
    <TProvider languageFiles={languageFiles}>
      <Test />
    </TProvider>
  </StrictMode>,
);
