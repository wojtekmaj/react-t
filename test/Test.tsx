import { Suspense, useEffect, useState } from 'react';
import T, { TProvider, useTranslation } from '@wojtekmaj/react-t';
import { useTick } from '@wojtekmaj/react-hooks';

import LocaleOptions from './LocaleOptions.js';
import Options from './Options.js';

import './Test.css';

import { languageFiles, delayedLanguageFiles } from './i18n/index.js';

import type { PassMethod } from './shared/types.js';

function FancyJohn() {
  const tick = useTick();
  const oneTwo = tick % 2 === 0;

  return (
    <strong>
      {oneTwo ? '✨' : '🌟'} John {oneTwo ? '🌟' : '✨'}
    </strong>
  );
}

function TestContent() {
  const stringOne = useTranslation('Hello world!');
  const stringTwo = useTranslation('Hello {name}!', { name: 'John' });
  const stringThree = useTranslation('Hello {name} and {other}!', {
    name: 'John',
    other: 'Elisabeth',
  });
  const stringFour = useTranslation('Hello {name}! Nice to meet you {name}!', {
    name: 'John',
  });
  const stringFive = useTranslation('Hello {name}!', { name: <FancyJohn /> });

  return (
    <main className="Test__container__content">
      <h2>
        Using <code>T</code> component
      </h2>
      <p>
        <T>Hello world!</T>
      </p>
      <p>
        <T name="John">{'Hello {name}!'}</T>
      </p>
      <p>
        <T name="John" other="Elisabeth">
          {'Hello {name} and {other}!'}
        </T>
      </p>
      <p>
        <T name="John">{'Hello {name}! Nice to meet you {name}!'}</T>
      </p>
      <p>
        <T name={<FancyJohn />}>{'Hello {name}!'}</T>
      </p>
      <h3>Always in Spanish</h3>
      <TProvider locale="es">
        <p>
          <T>Hello world!</T>
        </p>
      </TProvider>
      <h2>
        Using <code>useTranslation</code> hook
      </h2>
      <p>{stringOne}</p>
      <p>{stringTwo}</p>
      <p>{stringThree}</p>
      <p>{stringFour}</p>
      <p>{stringFive}</p>
    </main>
  );
}

export default function Test() {
  const [locale, setLocale] = useState<string>();
  const [delay, setDelay] = useState(false);
  const [suspend, setSuspend] = useState(false);
  const [passMethod, setPassMethod] = useState<PassMethod>('attribute');

  useEffect(() => {
    const html = document.documentElement;

    if (locale && passMethod === 'attribute') {
      html.setAttribute('lang', locale);
    } else {
      html.removeAttribute('lang');
    }
  }, [locale, passMethod]);

  return (
    <div className="Test">
      <header>
        <h1>react-t test page</h1>
      </header>
      <div className="Test__container">
        <aside className="Test__container__options">
          <LocaleOptions locale={locale} setLocale={setLocale} />
          <Options
            delay={delay}
            passMethod={passMethod}
            suspend={suspend}
            setDelay={setDelay}
            setPassMethod={setPassMethod}
            setSuspend={setSuspend}
          />
        </aside>
        <Suspense fallback={<div>Loading…</div>}>
          <TProvider
            key={suspend ? 'provider-suspend' : 'provider'}
            locale={passMethod === 'prop' ? locale : undefined}
            languageFiles={delay ? delayedLanguageFiles : languageFiles}
            suspend={suspend}
          >
            <TestContent />
          </TProvider>
        </Suspense>
      </div>
    </div>
  );
}
