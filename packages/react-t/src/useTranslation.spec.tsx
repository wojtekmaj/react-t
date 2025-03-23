import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { getUserLocales } from 'get-user-locale';

import useTranslation from './useTranslation.js';
import TProvider from './TProvider.js';

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

  it('throws when rendered without TProvider context', () => {
    muteConsole();

    expect(() => renderHook(() => useTranslation('Hello world!'))).toThrowError();

    restoreConsole();
  });

  it('renders nothing given nothing', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper: TProvider });

    expect(result.current).toBe(undefined);
  });

  it('returns original phrase given no language files', () => {
    const { result } = renderHook(() => useTranslation('Hello world!'), { wrapper: TProvider });

    expect(result.current).toBe('Hello world!');
  });

  it('returns original phrase with variable given no language files', () => {
    const { result } = renderHook(() => useTranslation('Hello {name}!', { name: 'John' }), {
      wrapper: TProvider,
    });

    expect(result.current).toBe('Hello John!');
  });

  it('returns original phrase with ReactNode variable given no language files', () => {
    const { result } = renderHook(
      () => useTranslation('Hello {name}!', { name: <strong>John</strong> }),
      { wrapper: TProvider },
    );

    expect(result.current).toMatchSnapshot();
  });

  it('returns original phrase with variable placeholder given no language files and no args', () => {
    const { result } = renderHook(() => useTranslation('Hello {name}!'), { wrapper: TProvider });

    expect(result.current).toBe('Hello {name}!');
  });

  it('returns original phrase with multiple variables given no language files', () => {
    const { result } = renderHook(
      () => useTranslation('Hello {name} and {other}!', { name: 'John', other: 'Elisabeth' }),
      { wrapper: TProvider },
    );

    expect(result.current).toBe('Hello John and Elisabeth!');
  });

  it('returns original phrase with one variable used multiple times given no language files', () => {
    const { result } = renderHook(
      () => useTranslation('Hello {name}! Nice to meet you {name}!', { name: 'John' }),
      { wrapper: TProvider },
    );

    expect(result.current).toBe('Hello John! Nice to meet you John!');
  });

  it('returns original phrase if html lang is given but no languageFiles were given', () => {
    muteConsole();

    document.documentElement.setAttribute('lang', 'de-DE');

    const { result } = renderHook(() => useTranslation('Hello world!'), { wrapper: TProvider });

    expect(result.current).toBe('Hello world!');

    restoreConsole();
  });

  it('returns original phrase if html lang equal to defaultLanguage is given', async () => {
    document.documentElement.setAttribute('lang', 'en-US');

    const { result } = renderHook(() => useTranslation('Hello world!'), {
      wrapper: TProvider,
    });

    expect(result.current).toBe('Hello world!');
  });

  it('returns original phrase if language file is still loading', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    const { result } = renderHook(() => useTranslation('Hello world!'), {
      wrapper: TProvider,
    });

    expect(result.current).toBe('Hello world!');
  });

  it('returns translated phrase if html lang is given and language files are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={languageFiles}>{children}</TProvider>;
    }

    const { result } = renderHook(() => useTranslation('Hello world!'), { wrapper });

    expect(result.current).toBe('Hallo Welt!');
  });

  it('returns translated phrase with variable if locale prop is given', () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <TProvider languageFiles={languageFiles} locale="de-DE">
          {children}
        </TProvider>
      );
    }

    const { result } = renderHook(() => useTranslation('Hello {name}!', { name: 'John' }), {
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

    const { result } = renderHook(() => useTranslation('Hello world!'), { wrapper });

    expect(result.current).toBe('¡Hola Mundo!');
  });

  it('returns translated phrase with ReactNode variable if locale prop is given', () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <TProvider languageFiles={languageFiles} locale="de-DE">
          {children}
        </TProvider>
      );
    }

    const { result } = renderHook(
      () => useTranslation('Hello {name}!', { name: <strong>John</strong> }),
      { wrapper },
    );

    expect(result.current).toMatchSnapshot();
  });

  it('returns translated phrase with variable placeholder if locale prop is given given no args', () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={languageFiles}>{children}</TProvider>;
    }

    const { result } = renderHook(() => useTranslation('Hello {name}!'), { wrapper });

    expect(result.current).toBe('Hallo {name}!');
  });

  it('returns translated phrase with multiple variables if locale prop is given', () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <TProvider languageFiles={languageFiles} locale="de-DE">
          {children}
        </TProvider>
      );
    }

    const { result } = renderHook(
      () => useTranslation('Hello {name} and {other}!', { name: 'John', other: 'Elisabeth' }),
      { wrapper },
    );

    expect(result.current).toBe('Hallo John und Elisabeth!');
  });

  it('returns translated phrase with one variable used multiple times if locale prop is given', () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={languageFiles}>{children}</TProvider>;
    }

    const { result } = renderHook(
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

    const { result } = renderHook(() => useTranslation('Hello world!'), { wrapper });

    expect(result.current).toBe('Hallo Welt!');
  });

  it('returns translated phrase if html lang is given and asynchronous functions returning language files are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={asyncLanguageFiles}>{children}</TProvider>;
    }

    const { result } = renderHook(() => useTranslation('Hello world!'), { wrapper });

    await waitFor(() => expect(result.current).toBe('Hallo Welt!'));
  });

  it('returns translated phrase if html lang is given and asynchronous functions returning language files as ESM modules are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={asyncLanguageFilesEsm}>{children}</TProvider>;
    }

    const { result } = renderHook(() => useTranslation('Hello world!'), { wrapper });

    await waitFor(() => expect(result.current).toBe('Hallo Welt!'));
  });

  it('changes translated phrase if html lang is changed', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={asyncLanguageFiles}>{children}</TProvider>;
    }

    const { rerender, result } = renderHook(() => useTranslation('Hello world!'), {
      wrapper,
    });

    await waitFor(() => expect(result.current).toBe('Hallo Welt!'));

    act(() => {
      document.documentElement.setAttribute('lang', 'es-ES');
    });

    rerender();

    await waitFor(() => expect(result.current).toBe('¡Hola Mundo!'));
  });

  it('changes translated phrase if html lang is changed to value equal to defaultLanguage', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={asyncLanguageFiles}>{children}</TProvider>;
    }

    const { rerender, result } = renderHook(() => useTranslation('Hello world!'), {
      wrapper,
    });

    await waitFor(() => expect(result.current).toBe('Hallo Welt!'));

    act(() => {
      document.documentElement.setAttribute('lang', 'en-US');
    });

    rerender();

    await waitFor(() => expect(result.current).toBe('Hello world!'));
  });

  it('returns original phrase if browser language is given but no languageFiles were given', () => {
    muteConsole();

    const languageGetter = vi.spyOn(window.navigator, 'language', 'get');
    languageGetter.mockReturnValue('de-DE');

    const { result } = renderHook(() => useTranslation('Hello world!'), { wrapper: TProvider });

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

    const { result } = renderHook(() => useTranslation('Hello world!'), { wrapper });

    await waitFor(() => expect(result.current).toBe('Hallo Welt!'));

    languageGetter.mockRestore();
  });

  it('returns original phrase if locale prop is given but no languageFiles were given', () => {
    muteConsole();

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider locale="de-DE">{children}</TProvider>;
    }

    const { result } = renderHook(() => useTranslation('Hello world!'), { wrapper });

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

    const { result } = renderHook(() => useTranslation('Hello world!'), { wrapper });

    await waitFor(() => expect(result.current).toBe('Hallo Welt!'));
  });

  it('returns empty string if the translated phrase is an empty string', async () => {
    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <TProvider languageFiles={{ 'de-DE': { foo: 'foo', bar: '' } }} locale="de-DE">
          {children}
        </TProvider>
      );
    }

    const { result } = renderHook(() => useTranslation('bar'), { wrapper });

    await waitFor(() => expect(result.current).toBe(''));
  });
});
