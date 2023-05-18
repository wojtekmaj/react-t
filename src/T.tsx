import React from 'react';
import PropTypes from 'prop-types';

import useTranslation from './useTranslation';

type Args = Record<string, string>;

export type TProps = {
  children?: string;
} & Args;

export default function T({ children, ...args }: TProps) {
  const translatedChildren = useTranslation(children, args);
  return translatedChildren === undefined ? null : <>{translatedChildren}</>;
}

T.propTypes = {
  children: PropTypes.string,
};
