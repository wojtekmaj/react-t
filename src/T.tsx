import PropTypes from 'prop-types';

import useTranslation from './useTranslation';

export default function T({ children, ...args }) {
  const translatedChildren = useTranslation(children, args);
  return translatedChildren === undefined ? null : translatedChildren;
}

T.propTypes = {
  children: PropTypes.string,
};
