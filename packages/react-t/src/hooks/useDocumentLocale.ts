import { useCallback, useEffect, useState } from 'react';
import { useMutationObserver } from '@wojtekmaj/react-hooks';

const isBrowser = typeof window !== 'undefined';

const observerConfig = {
  attributeFilter: ['lang'],
  attributes: true,
};

export default function useDocumentLocale(): string | null {
  const [documentLocale, setDocumentLocale] = useState(
    isBrowser ? document.documentElement.getAttribute('lang') : null,
  );

  const onLangAttributeChange = useCallback(() => {
    const nextLocale = isBrowser ? document.documentElement.getAttribute('lang') : null;
    setDocumentLocale(nextLocale);
  }, []);

  useEffect(onLangAttributeChange, []);

  useMutationObserver(
    isBrowser ? document.documentElement : null,
    observerConfig,
    onLangAttributeChange,
  );

  return documentLocale;
}
