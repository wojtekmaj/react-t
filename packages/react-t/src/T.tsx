import useTranslation from './useTranslation.js';

import type { Args } from './shared/types.js';

export type TProps = {
  children?: string;
} & Args;

const T: React.FC<TProps> = function T({ children, ...args }) {
  const translatedChildren = useTranslation(children, args);

  return translatedChildren === undefined ? null : <>{translatedChildren}</>;
};

export default T;
