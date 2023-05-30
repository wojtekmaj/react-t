import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { act, render } from '@testing-library/react';
import { getUserLocales } from 'get-user-locale';

import T from './T';
import TProvider from './TProvider';

import { muteConsole, restoreConsole } from '../test-utils';

import type { LanguageFile, LanguageFileModule } from './types';

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

const syncLanguageFiles = {
  'de-DE': () => deLanguageFile,
  'es-ES': () => esLanguageFile,
};

const asyncLanguageFiles: Record<string, () => Promise<LanguageFile>> = {
  'de-DE': () => new Promise((resolve) => resolve(deLanguageFile)),
  'es-ES': () => new Promise((resolve) => resolve(esLanguageFile)),
};

const asyncLanguageFilesEsm: Record<string, () => Promise<LanguageFileModule>> = {
  'de-DE': () => new Promise((resolve) => resolve({ default: deLanguageFile })),
  'es-ES': () => new Promise((resolve) => resolve({ default: esLanguageFile })),
};

vi.mock('lodash.once', () => ({ default: (fn: () => void) => fn }));

vi.mock('get-user-locale', () => ({
  getUserLocales: vi.fn(),
}));

vi.mocked(getUserLocales).mockImplementation(() =>
  Array.from(new Set([...navigator.languages, navigator.language, 'en-US'])),
);

describe('<T /> component', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('lang');
  });

  it('throws when rendered without TProvider context', () => {
    muteConsole();

    expect(() => render(<T>Hello world!</T>)).toThrowError();

    restoreConsole();
  });

  it('renders nothing given nothing', () => {
    const { container } = render(
      <TProvider>
        <T />
      </TProvider>,
    );

    expect(container.firstChild).toBe(null);
  });

  it('returns original phrase given no language files', () => {
    const { getByText } = render(
      <TProvider>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(getByText('Hello world!')).toBeInTheDocument();
  });

  it('returns original phrase with variable given no language files', () => {
    const { getByText } = render(
      <TProvider>
        <T name="John">{'Hello {name}!'}</T>
      </TProvider>,
    );

    expect(getByText('Hello John!')).toBeInTheDocument();
  });

  it('returns original phrase with variable placeholder given no language files and no args', () => {
    const { getByText } = render(
      <TProvider>
        <T>{'Hello {name}!'}</T>
      </TProvider>,
    );

    expect(getByText('Hello {name}!')).toBeInTheDocument();
  });

  it('returns original phrase with multiple variables given no language files', () => {
    const { getByText } = render(
      <TProvider>
        <T name="John" other="Elisabeth">
          {'Hello {name} and {other}!'}
        </T>
      </TProvider>,
    );

    expect(getByText('Hello John and Elisabeth!')).toBeInTheDocument();
  });

  it('returns original phrase with one variable used multiple times given no language files', () => {
    const { getByText } = render(
      <TProvider>
        <T name="John">{'Hello {name}! Nice to meet you {name}!'}</T>
      </TProvider>,
    );

    expect(getByText('Hello John! Nice to meet you John!')).toBeInTheDocument();
  });

  it('returns original phrase if html lang is given but no languageFiles were given', () => {
    muteConsole();

    document.documentElement.setAttribute('lang', 'de-DE');

    const { getByText } = render(
      <TProvider>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(getByText('Hello world!')).toBeInTheDocument();

    restoreConsole();
  });

  it('returns original phrase if html lang equal to defaultLanguage is given', async () => {
    document.documentElement.setAttribute('lang', 'en-US');

    const { getByText } = render(
      <TProvider languageFiles={languageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(getByText('Hello world!')).toBeInTheDocument();
  });

  it('returns translated phrase if html lang is given and language files are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const { getByText } = render(
      <TProvider languageFiles={languageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(getByText('Hallo Welt!')).toBeInTheDocument();
  });

  it('returns translated phrase with variable if locale prop is given', () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const { getByText } = render(
      <TProvider languageFiles={languageFiles}>
        <T name="John">{'Hello {name}!'}</T>
      </TProvider>,
    );

    expect(getByText('Hallo John!')).toBeInTheDocument();
  });

  it('returns translated phrase with variable placeholder if locale prop is given given no args', () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const { getByText } = render(
      <TProvider languageFiles={languageFiles}>
        <T>{'Hello {name}!'}</T>
      </TProvider>,
    );

    expect(getByText('Hallo {name}!')).toBeInTheDocument();
  });

  it('returns translated phrase with multiple variables if locale prop is given', () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const { getByText } = render(
      <TProvider languageFiles={languageFiles}>
        <T name="John" other="Elisabeth">
          {'Hello {name} and {other}!'}
        </T>
      </TProvider>,
    );

    expect(getByText('Hallo John und Elisabeth!')).toBeInTheDocument();
  });

  it('returns translated phrase with one variable used multiple times if locale prop is given', () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const { getByText } = render(
      <TProvider languageFiles={languageFiles}>
        <T name="John" other="Elisabeth">
          {'Hello {name}! Nice to meet you {name}!'}
        </T>
      </TProvider>,
    );

    expect(getByText('Hallo John! Schön, dich zu treffen John!')).toBeInTheDocument();
  });

  it('returns translated phrase if html lang is given and synchronous functions returning language files are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const { findByText } = render(
      <TProvider languageFiles={syncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(await findByText('Hallo Welt!')).toBeInTheDocument();
  });

  it('returns translated phrase if html lang is given and asynchronous functions returning language files are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const { findByText } = render(
      <TProvider languageFiles={asyncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(await findByText('Hallo Welt!')).toBeInTheDocument();
  });
  it('returns translated phrase if html lang is given and asynchronous functions returning language files as ESM modules are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const { findByText } = render(
      <TProvider languageFiles={asyncLanguageFilesEsm}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(await findByText('Hallo Welt!')).toBeInTheDocument();
  });

  it('changes translated phrase if html lang is changed', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const { findByText } = render(
      <TProvider languageFiles={asyncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(await findByText('Hallo Welt!')).toBeInTheDocument();

    act(() => {
      document.documentElement.setAttribute('lang', 'es-ES');
    });

    expect(await findByText('¡Hola Mundo!')).toBeInTheDocument();
  });

  it('changes translated phrase if html lang is changed to value equal to defaultLanguage', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const { findByText } = render(
      <TProvider languageFiles={asyncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(await findByText('Hallo Welt!')).toBeInTheDocument();

    act(() => {
      document.documentElement.setAttribute('lang', 'en-US');
    });

    expect(await findByText('Hello world!')).toBeInTheDocument();
  });

  it('returns original phrase if browser language is given but no languageFiles were given', () => {
    muteConsole();

    const languageGetter = vi.spyOn(window.navigator, 'language', 'get');
    languageGetter.mockReturnValue('de-DE');

    const { getByText } = render(
      <TProvider>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(getByText('Hello world!')).toBeInTheDocument();

    languageGetter.mockRestore();

    restoreConsole();
  });

  it('returns translated phrase if browser language is given', async () => {
    const languageGetter = vi.spyOn(window.navigator, 'language', 'get');
    languageGetter.mockReturnValue('de-DE');

    const { findByText } = render(
      <TProvider languageFiles={asyncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(await findByText('Hallo Welt!')).toBeInTheDocument();

    languageGetter.mockRestore();
  });

  it('returns original phrase if locale prop is given but no languageFiles were given', () => {
    muteConsole();

    const { getByText } = render(
      <TProvider locale="de-DE">
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(getByText('Hello world!')).toBeInTheDocument();

    restoreConsole();
  });

  it('returns translated phrase if locale prop is given', async () => {
    const { findByText } = render(
      <TProvider languageFiles={asyncLanguageFiles} locale="de-DE">
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(await findByText('Hallo Welt!')).toBeInTheDocument();
  });
});
