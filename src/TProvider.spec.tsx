import { describe, it } from 'vitest';
import React from 'react';

import TProvider from './TProvider';

import type { LanguageFile } from './shared/types';

const deLanguageFile: LanguageFile = {
  'Hello world!': 'Hallo Welt!',
  'Hello {name}!': 'Hallo {name}!',
  'Hello {name} and {other}!': 'Hallo {name} und {other}!',
  'Hello {name}! Nice to meet you {name}!': 'Hallo {name}! Schön, dich zu treffen {name}!',
};

const esLanguageFile: LanguageFile = {
  'Hello world!': '¡Hola Mundo!',
  'Hello {name}!': '¡Hola {name}!',
  'Hello {name} and {other}!': '¡Hola {name} y {other}!',
  'Hello {name}! Nice to meet you {name}!': '¡Hola {name}! ¡Encantado de conocerte {name}!',
};

const languageFiles = {
  'de-DE': deLanguageFile,
  'es-ES': esLanguageFile,
};

describe('<TProvider /> component', () => {
  it('should not allow both languageFile and languageFiles to be passed', () => {
    // @ts-expect-error-next-line
    <TProvider languageFile={deLanguageFile} languageFiles={languageFiles} />;
  });

  it('should allow languageFile to be passed', () => {
    // @ts-expect-no-error
    <TProvider languageFile={deLanguageFile} />;
  });

  it('should allow languageFiles to be passed', () => {
    // @ts-expect-no-error
    <TProvider languageFiles={languageFiles} />;
  });
});
