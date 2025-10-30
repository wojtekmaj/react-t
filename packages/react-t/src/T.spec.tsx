import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Suspense } from 'react';
import { act } from 'react-dom/test-utils';
import { getUserLocales } from 'get-user-locale';

import T from './T.js';
import TProvider from './TProvider.js';

import { muteConsole, restoreConsole } from '../../../test-utils.js';

import type { LanguageFile, LanguageFileModule } from './shared/types.js';

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

const delayedLanguageFiles = {
  'de-DE': async () => {
    await sleep(1000);

    return deLanguageFile;
  },
  'es-ES': async () => {
    await sleep(1000);

    return esLanguageFile;
  },
};

vi.mock('get-user-locale', () => ({
  getUserLocales: vi.fn(),
}));

function uniq<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

vi.mocked(getUserLocales).mockImplementation(() =>
  uniq([...navigator.languages, navigator.language, 'en-US']),
);

describe('<T /> component', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('lang');

    vi.clearAllMocks();
  });

  it('throws when rendered without TProvider context', async () => {
    muteConsole();

    await expect(render(<T>Hello world!</T>)).rejects.toThrowError(
      'Invariant failed: Unable to find TProvider context. Did you wrap your app in <TProvider />?',
    );

    restoreConsole();
  });

  it('renders nothing given nothing', async () => {
    const { container } = await render(
      <TProvider>
        <T />
      </TProvider>,
    );

    expect(container.firstChild).toBe(null);
  });

  it('returns original phrase given no language files', async () => {
    await render(
      <TProvider>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(page.getByText('Hello world!')).toBeInTheDocument();
  });

  it('returns original phrase with variable given no language files', async () => {
    await render(
      <TProvider>
        <T name="John">{'Hello {name}!'}</T>
      </TProvider>,
    );

    expect(page.getByText('Hello John!')).toBeInTheDocument();
  });

  it('returns original phrase with ReactNode variable given no language files', async () => {
    const { container } = await render(
      <TProvider>
        <T name={<strong>John</strong>}>{'Hello {name}!'}</T>
      </TProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  it('returns original phrase with variable placeholder given no language files and no args', async () => {
    await render(
      <TProvider>
        <T>{'Hello {name}!'}</T>
      </TProvider>,
    );

    expect(page.getByText('Hello {name}!')).toBeInTheDocument();
  });

  it('returns original phrase with multiple variables given no language files', async () => {
    await render(
      <TProvider>
        <T name="John" other="Elisabeth">
          {'Hello {name} and {other}!'}
        </T>
      </TProvider>,
    );

    expect(page.getByText('Hello John and Elisabeth!')).toBeInTheDocument();
  });

  it('returns original phrase with one variable used multiple times given no language files', async () => {
    await render(
      <TProvider>
        <T name="John">{'Hello {name}! Nice to meet you {name}!'}</T>
      </TProvider>,
    );

    expect(page.getByText('Hello John! Nice to meet you John!')).toBeInTheDocument();
  });

  it('returns original phrase if html lang is given but no languageFiles were given', async () => {
    muteConsole();

    document.documentElement.setAttribute('lang', 'de-DE');

    await render(
      <TProvider>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(page.getByText('Hello world!')).toBeInTheDocument();

    restoreConsole();
  });

  it('returns original phrase if html lang equal to default language is given', async () => {
    document.documentElement.setAttribute('lang', 'en-US');

    await render(
      <TProvider languageFiles={languageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(page.getByText('Hello world!')).toBeInTheDocument();
  });

  it('returns original phrase if html lang equal to default language is given even if matching browser language is given', async () => {
    document.documentElement.setAttribute('lang', 'en-US');

    const languageGetter = vi.spyOn(window.navigator, 'language', 'get');
    languageGetter.mockReturnValue('de-DE');

    await render(
      <TProvider defaultLocale="en-US" languageFiles={languageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(page.getByText('Hello world!')).toBeInTheDocument();
  });

  it('returns original phrase if language file is still loading', () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    render(
      <TProvider languageFiles={asyncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(page.getByText('Hello world!')).toBeInTheDocument();
  });

  it('triggers Suspense if language file is still loading given suspend = true', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    await render(
      <Suspense fallback={<div>Loading…</div>}>
        <TProvider languageFiles={delayedLanguageFiles} suspend>
          <T>Hello world!</T>
        </TProvider>
      </Suspense>,
    );

    expect(page.getByText('Loading…')).toBeInTheDocument();
  });

  it('returns translated phrase if html lang is given and language files are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    await render(
      <TProvider languageFiles={languageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(page.getByText('Hallo Welt!')).toBeInTheDocument();
  });

  it('returns translated phrase with variable if locale prop is given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    await render(
      <TProvider languageFiles={languageFiles}>
        <T name="John">{'Hello {name}!'}</T>
      </TProvider>,
    );

    expect(page.getByText('Hallo John!')).toBeInTheDocument();
  });

  it('returns translated phrases with lang overwritten by the second TProvider', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    await render(
      <TProvider languageFiles={languageFiles}>
        <p>
          <T>Hello world!</T>
        </p>
        <TProvider locale="es-ES">
          <p>
            <T>Hello world!</T>
          </p>
        </TProvider>
      </TProvider>,
    );

    expect(page.getByText('Hallo Welt!')).toBeInTheDocument();
    expect(page.getByText('¡Hola Mundo!')).toBeInTheDocument();
  });

  it('returns translated phrase with ReactNode variable if locale prop is given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const { container } = await render(
      <TProvider languageFiles={languageFiles}>
        <T name={<strong>John</strong>}>{'Hello {name}!'}</T>
      </TProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  it('returns translated phrase with variable placeholder if locale prop is given given no args', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    await render(
      <TProvider languageFiles={languageFiles}>
        <T>{'Hello {name}!'}</T>
      </TProvider>,
    );

    expect(page.getByText('Hallo {name}!')).toBeInTheDocument();
  });

  it('returns translated phrase with multiple variables if locale prop is given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    await render(
      <TProvider languageFiles={languageFiles}>
        <T name="John" other="Elisabeth">
          {'Hello {name} and {other}!'}
        </T>
      </TProvider>,
    );

    expect(page.getByText('Hallo John und Elisabeth!')).toBeInTheDocument();
  });

  it('returns translated phrase with one variable used multiple times if locale prop is given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    await render(
      <TProvider languageFiles={languageFiles}>
        <T name="John" other="Elisabeth">
          {'Hello {name}! Nice to meet you {name}!'}
        </T>
      </TProvider>,
    );

    expect(page.getByText('Hallo John! Schön, dich zu treffen John!')).toBeInTheDocument();
  });

  it('returns translated phrase if html lang is given and synchronous functions returning language files are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    await render(
      <TProvider languageFiles={syncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    await expect.element(page.getByText('Hallo Welt!')).toBeInTheDocument();
  });

  it('returns translated phrase if html lang is given and asynchronous functions returning language files are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    await render(
      <TProvider languageFiles={asyncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    await expect.element(page.getByText('Hallo Welt!')).toBeInTheDocument();
  });

  it('returns translated phrase if html lang is given and asynchronous functions returning language files as ESM modules are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    await render(
      <TProvider languageFiles={asyncLanguageFilesEsm}>
        <T>Hello world!</T>
      </TProvider>,
    );

    await expect.element(page.getByText('Hallo Welt!')).toBeInTheDocument();
  });

  it('changes translated phrase if html lang is changed', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    await render(
      <TProvider languageFiles={asyncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    await expect.element(page.getByText('Hallo Welt!')).toBeInTheDocument();

    act(() => {
      document.documentElement.setAttribute('lang', 'es-ES');
    });

    await expect.element(page.getByText('¡Hola Mundo!')).toBeInTheDocument();
  });

  it('changes translated phrase if html lang is changed to value equal to default language', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const languageGetter = vi.spyOn(window.navigator, 'language', 'get');
    languageGetter.mockReturnValue('en-US');

    await render(
      <TProvider languageFiles={asyncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    await expect.element(page.getByText('Hallo Welt!')).toBeInTheDocument();

    act(() => {
      document.documentElement.setAttribute('lang', 'en-US');
    });

    await expect.element(page.getByText('Hello world!')).toBeInTheDocument();
  });

  it('returns original phrase if browser language is given but no languageFiles were given', async () => {
    muteConsole();

    const languageGetter = vi.spyOn(window.navigator, 'language', 'get');
    languageGetter.mockReturnValue('de-DE');

    await render(
      <TProvider>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(page.getByText('Hello world!')).toBeInTheDocument();

    languageGetter.mockRestore();

    restoreConsole();
  });

  it('returns translated phrase if browser language is given', async () => {
    const languageGetter = vi.spyOn(window.navigator, 'language', 'get');
    languageGetter.mockReturnValue('de-DE');

    await render(
      <TProvider languageFiles={asyncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    await expect.element(page.getByText('Hallo Welt!')).toBeInTheDocument();

    languageGetter.mockRestore();
  });

  it('returns original phrase if locale prop is given but no languageFiles were given', async () => {
    muteConsole();

    await render(
      <TProvider locale="de-DE">
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(page.getByText('Hello world!')).toBeInTheDocument();

    restoreConsole();
  });

  it('returns original phrase if locale prop equal to default language is given even if matching browser language is given', async () => {
    const languageGetter = vi.spyOn(window.navigator, 'language', 'get');
    languageGetter.mockReturnValue('de-DE');

    await render(
      <TProvider defaultLocale="en-US" languageFiles={languageFiles} locale="en-US">
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(page.getByText('Hello world!')).toBeInTheDocument();
  });

  it('returns translated phrase if locale prop is given', async () => {
    await render(
      <TProvider languageFiles={asyncLanguageFiles} locale="de-DE">
        <T>Hello world!</T>
      </TProvider>,
    );

    await expect.element(page.getByText('Hallo Welt!')).toBeInTheDocument();
  });

  it('returns empty string if the translated phrase is an empty string', async () => {
    await render(
      <TProvider languageFiles={{ 'de-DE': { foo: 'foo', bar: '' } }} locale="de-DE">
        <T>foo</T>
        <T>bar</T>
      </TProvider>,
    );

    await expect.element(page.getByText('foo')).toBeInTheDocument();
    await expect.element(page.getByText('bar')).not.toBeInTheDocument();
  });
});
