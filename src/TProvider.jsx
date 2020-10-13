import React, {
  createContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';

import { getMatchingLocale } from './utils';

export const Context = createContext();

function getLocaleFromDocument() {
  return document.documentElement.getAttribute('lang');
}

export default function TProvider({ children, defaultLocale = 'en-US', languageFiles = {} }) {
  function getLocaleFromUserPreferences() {
    const supportedLocales = Object.keys(languageFiles);
    return getMatchingLocale(supportedLocales);
  }

  function getLocaleFromDocumentOrUserPreferences() {
    return getLocaleFromDocument() || getLocaleFromUserPreferences();
  }

  const observer = useRef();
  const [locale, setLocale] = useState(getLocaleFromDocumentOrUserPreferences);

  function onLangAttributeChange() {
    setLocale(getLocaleFromDocumentOrUserPreferences);
  }

  useEffect(() => {
    onLangAttributeChange();
    observer.current = new MutationObserver(onLangAttributeChange);
    observer.current.observe(
      document.documentElement,
      {
        attributeFilter: ['lang'],
        attributes: true,
      },
    );

    return () => observer.current.disconnect();
  }, []);

  return (
    <Context.Provider
      value={{
        defaultLocale,
        languageFiles,
        locale,
      }}
    >
      {children}
    </Context.Provider>
  );
}

TProvider.propTypes = {
  children: PropTypes.node,
  defaultLocale: PropTypes.string,
  languageFiles: PropTypes.objectOf(PropTypes.func),
};
