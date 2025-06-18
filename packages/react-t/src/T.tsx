import useTranslation from './useTranslation.js';

import type { Args } from './shared/types.js';

export type TProps = {
  children?: string;
} & Args;

export default function T({ children, ...args }: TProps): React.ReactNode {
  const translatedChildren = useTranslation(children, args);

  return translatedChildren === undefined ? null : translatedChildren;
}
