import { useContext } from 'react';
import invariant from 'tiny-invariant';

import TContext from './TContext.js';

export default function useLocale(): string | null {
  const context = useContext(TContext);

  invariant(context, 'Unable to find TProvider context. Did you wrap your app in <TProvider />?');

  const { locale } = context;

  return locale;
}
