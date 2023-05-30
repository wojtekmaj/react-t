import React, { useEffect, useState } from 'react';
import T, { useTranslation } from '@wojtekmaj/react-t/src';

import LocaleOptions from './LocaleOptions';

import './Test.css';

export default function Test() {
  const [locale, setLocale] = useState<string>();

  const stringOne = useTranslation('Hello world!');
  const stringTwo = useTranslation('Hello {name}!', { name: 'John' });
  const stringThree = useTranslation('Hello {name} and {other}!', {
    name: 'John',
    other: 'Elisabeth',
  });

  useEffect(() => {
    const html = document.documentElement;

    if (locale) {
      html.setAttribute('lang', locale);
    } else {
      html.removeAttribute('lang');
    }
  });

  return (
    <div className="Test">
      <header>
        <h1>react-t test page</h1>
      </header>
      <div className="Test__container">
        <aside className="Test__container__options">
          <LocaleOptions locale={locale} setLocale={setLocale} />
        </aside>
        <main className="Test__container__content">
          <h2>
            Using <code>T</code> component
          </h2>
          <p>
            <T>Hello world!</T>
          </p>
          <p>
            <T name="John">{`Hello {name}!`}</T>
          </p>
          <p>
            <T name="John" other="Elisabeth">{`Hello {name} and {other}!`}</T>
          </p>
          <h2>
            Using <code>useTranslation</code> hook
          </h2>
          <p>{stringOne}</p>
          <p>{stringTwo}</p>
          <p>{stringThree}</p>
        </main>
      </div>
    </div>
  );
}
