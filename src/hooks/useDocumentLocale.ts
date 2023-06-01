import { useCallback, useEffect, useState } from 'react';
import { useMutationObserver } from '@wojtekmaj/react-hooks';

const isBrowser = typeof document !== 'undefined';

const observerConfig = {
  attributeFilter: ['lang'],
  attributes: true,
};

export default function useDocumentLocale(): string | null {
  const [documentLocale, setDocumentLocale] = useState(
    isBrowser ? document.documentElement.getAttribute('lang') : null,
  );

  const onLangAttributeChange = useCallback(() => {
    const nextLocale = document.documentElement.getAttribute('lang');
    setDocumentLocale(nextLocale);
  }, []);

  useEffect(onLangAttributeChange, [onLangAttributeChange]);

  useMutationObserver(
    isBrowser ? document.documentElement : null,
    observerConfig,
    onLangAttributeChange,
  );

  return documentLocale;
}
