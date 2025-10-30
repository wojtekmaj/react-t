import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { act } from 'react-dom/test-utils';
import { getUserLocales } from 'get-user-locale';

import TProvider from './TProvider.js';

import useTranslation from './useTranslation.js';

import { muteConsole, restoreConsole } from '../../../test-utils.js';

import type { LanguageFile, LanguageFileModule } from './shared/types.js';

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

vi.mock('get-user-locale', () => ({
  getUserLocales: vi.fn(),
}));

function uniq<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

vi.mocked(getUserLocales).mockImplementation(() =>
  uniq([...navigator.languages, navigator.language, 'en-US']),
);

describe('useTranslation() hook', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('lang');
  });

  it('throws when rendered without TProvider context', async () => {
    muteConsole();

    await expect(renderHook(() => useTranslation('Hello world!'))).rejects.toThrowError(
      'Invariant failed: Unable to find TProvider context. Did you wrap your app in <TProvider />',
    );

    restoreConsole();
  });

  it('renders nothing given nothing', async () => {
    const { result } = await renderHook(() => useTranslation(), { wrapper: TProvider });

    expect(result.current).toBe(undefined);
  });

  it('returns original phrase given no language files', async () => {
    const { result } = await renderHook(() => useTranslation('Hello world!'), {
      wrapper: TProvider,
    });

    expect(result.current).toBe('Hello world!');
  });

  it('returns original phrase with variable given no language files', async () => {
    const { result } = await renderHook(() => useTranslation('Hello {name}!', { name: 'John' }), {
      wrapper: TProvider,
    });

    expect(result.current).toBe('Hello John!');
  });

  it('returns original phrase with ReactNode variable given no language files', async () => {
    const { result } = await renderHook(
      () => useTranslation('Hello {name}!', { name: <strong>John</strong> }),
      { wrapper: TProvider },
    );

    expect(result.current).toMatchSnapshot();
  });

  it('returns original phrase with variable placeholder given no language files and no args', async () => {
    const { result } = await renderHook(() => useTranslation('Hello {name}!'), {
      wrapper: TProvider,
    });

    expect(result.current).toBe('Hello {name}!');
  });

  it('returns original phrase with multiple variables given no language files', async () => {
    const { result } = await renderHook(
      () => useTranslation('Hello {name} and {other}!', { name: 'John', other: 'Elisabeth' }),
      { wrapper: TProvider },
    );

    expect(result.current).toBe('Hello John and Elisabeth!');
  });

  it('returns original phrase with one variable used multiple times given no language files', async () => {
    const { result } = await renderHook(
      () => useTranslation('Hello {name}! Nice to meet you {name}!', { name: 'John' }),
      { wrapper: TProvider },
    );

    expect(result.current).toBe('Hello John! Nice to meet you John!');
  });

  it('returns original phrase if html lang is given but no languageFiles were given', async () => {
    muteConsole();

    document.documentElement.setAttribute('lang', 'de-DE');

    const { result } = await renderHook(() => useTranslation('Hello world!'), {
      wrapper: TProvider,
    });

    expect(result.current).toBe('Hello world!');

    restoreConsole();
  });

  it('returns original phrase if html lang equal to defaultLanguage is given', async () => {
    document.documentElement.setAttribute('lang', 'en-US');

    const { result } = await renderHook(() => useTranslation('Hello world!'), {
      wrapper: TProvider,
    });

    expect(result.current).toBe('Hello world!');
  });

  it('returns original phrase if language file is still loading', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const { result } = await renderHook(() => useTranslation('Hello world!'), {
      wrapper: TProvider,
    });

    expect(result.current).toBe('Hello world!');
  });

  it('returns translated phrase if html lang is given and language files are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={languageFiles}>{children}</TProvider>;
    }

    const { result } = await renderHook(() => useTranslation('Hello world!'), { wrapper });

    expect(result.current).toBe('Hallo Welt!');
  });

  it('returns translated phrase with variable if locale prop is given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <TProvider languageFiles={languageFiles} locale="de-DE">
          {children}
        </TProvider>
      );
    }

    const { result } = await renderHook(() => useTranslation('Hello {name}!', { name: 'John' }), {
      wrapper,
    });

    expect(result.current).toBe('Hallo John!');
  });

  it('returns translated phrases with lang overwritten by the second TProvider', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <TProvider languageFiles={languageFiles}>
          <TProvider locale="es-ES">{children}</TProvider>
        </TProvider>
      );
    }

    const { result } = await renderHook(() => useTranslation('Hello world!'), { wrapper });

    expect(result.current).toBe('¡Hola Mundo!');
  });

  it('returns translated phrase with ReactNode variable if locale prop is given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <TProvider languageFiles={languageFiles} locale="de-DE">
          {children}
        </TProvider>
      );
    }

    const { result } = await renderHook(
      () => useTranslation('Hello {name}!', { name: <strong>John</strong> }),
      { wrapper },
    );

    expect(result.current).toMatchSnapshot();
  });

  it('returns translated phrase with variable placeholder if locale prop is given given no args', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={languageFiles}>{children}</TProvider>;
    }

    const { result } = await renderHook(() => useTranslation('Hello {name}!'), { wrapper });

    expect(result.current).toBe('Hallo {name}!');
  });

  it('returns translated phrase with multiple variables if locale prop is given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <TProvider languageFiles={languageFiles} locale="de-DE">
          {children}
        </TProvider>
      );
    }

    const { result } = await renderHook(
      () => useTranslation('Hello {name} and {other}!', { name: 'John', other: 'Elisabeth' }),
      { wrapper },
    );

    expect(result.current).toBe('Hallo John und Elisabeth!');
  });

  it('returns translated phrase with one variable used multiple times if locale prop is given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={languageFiles}>{children}</TProvider>;
    }

    const { result } = await renderHook(
      () => useTranslation('Hello {name}! Nice to meet you {name}!', { name: 'John' }),
      { wrapper },
    );

    expect(result.current).toBe('Hallo John! Schön, dich zu treffen John!');
  });

  it('returns translated phrase if html lang is given and synchronous functions returning language files are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={syncLanguageFiles}>{children}</TProvider>;
    }

    const { result } = await renderHook(() => useTranslation('Hello world!'), { wrapper });

    expect(result.current).toBe('Hallo Welt!');
  });

  it('returns translated phrase if html lang is given and asynchronous functions returning language files are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={asyncLanguageFiles}>{children}</TProvider>;
    }

    const { result } = await renderHook(() => useTranslation('Hello world!'), { wrapper });

    await vi.waitFor(() => expect(result.current).toBe('Hallo Welt!'));
  });

  it('returns translated phrase if html lang is given and asynchronous functions returning language files as ESM modules are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={asyncLanguageFilesEsm}>{children}</TProvider>;
    }

    const { result } = await renderHook(() => useTranslation('Hello world!'), { wrapper });

    await vi.waitFor(() => expect(result.current).toBe('Hallo Welt!'));
  });

  it('changes translated phrase if html lang is changed', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={asyncLanguageFiles}>{children}</TProvider>;
    }

    const { rerender, result } = await renderHook(() => useTranslation('Hello world!'), {
      wrapper,
    });

    await vi.waitFor(() => expect(result.current).toBe('Hallo Welt!'));

    act(() => {
      document.documentElement.setAttribute('lang', 'es-ES');
    });

    await rerender();

    await vi.waitFor(() => expect(result.current).toBe('¡Hola Mundo!'));
  });

  it('changes translated phrase if html lang is changed to value equal to defaultLanguage', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={asyncLanguageFiles}>{children}</TProvider>;
    }

    const { rerender, result } = await renderHook(() => useTranslation('Hello world!'), {
      wrapper,
    });

    await vi.waitFor(() => expect(result.current).toBe('Hallo Welt!'));

    act(() => {
      document.documentElement.setAttribute('lang', 'en-US');
    });

    await rerender();

    await vi.waitFor(() => expect(result.current).toBe('Hello world!'));
  });

  it('returns original phrase if browser language is given but no languageFiles were given', async () => {
    muteConsole();

    const languageGetter = vi.spyOn(window.navigator, 'language', 'get');
    languageGetter.mockReturnValue('de-DE');

    const { result } = await renderHook(() => useTranslation('Hello world!'), {
      wrapper: TProvider,
    });

    expect(result.current).toBe('Hello world!');

    languageGetter.mockRestore();

    restoreConsole();
  });

  it('returns translated phrase if browser language is given', async () => {
    const languageGetter = vi.spyOn(window.navigator, 'language', 'get');
    languageGetter.mockReturnValue('de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={asyncLanguageFiles}>{children}</TProvider>;
    }

    const { result } = await renderHook(() => useTranslation('Hello world!'), { wrapper });

    await vi.waitFor(() => expect(result.current).toBe('Hallo Welt!'));

    languageGetter.mockRestore();
  });

  it('returns original phrase if locale prop is given but no languageFiles were given', async () => {
    muteConsole();

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider locale="de-DE">{children}</TProvider>;
    }

    const { result } = await renderHook(() => useTranslation('Hello world!'), { wrapper });

    expect(result.current).toBe('Hello world!');

    restoreConsole();
  });

  it('returns translated phrase if locale prop is given', async () => {
    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <TProvider languageFiles={asyncLanguageFiles} locale="de-DE">
          {children}
        </TProvider>
      );
    }

    const { result } = await renderHook(() => useTranslation('Hello world!'), { wrapper });

    await vi.waitFor(() => expect(result.current).toBe('Hallo Welt!'));
  });

  it('returns empty string if the translated phrase is an empty string', async () => {
    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <TProvider languageFiles={{ 'de-DE': { foo: 'foo', bar: '' } }} locale="de-DE">
          {children}
        </TProvider>
      );
    }

    const { result } = await renderHook(() => useTranslation('bar'), { wrapper });

    await vi.waitFor(() => expect(result.current).toBe(''));
  });
});
