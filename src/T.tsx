import React from 'react';
import PropTypes from 'prop-types';

import useTranslation from './useTranslation';

import type { Args } from './shared/types';

export type TProps = {
  children?: string;
} & Args;

const T: React.FC<TProps> = function T({ children, ...args }) {
  const translatedChildren = useTranslation(children, args);

  return translatedChildren === undefined ? null : <>{translatedChildren}</>;
};

T.propTypes = {
  children: PropTypes.string,
};

export default T;
