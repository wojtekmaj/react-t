import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { getUserLocales } from 'get-user-locale';

import TProvider from './TProvider.js';
import useLocale from './useLocale.js';

import { muteConsole, restoreConsole } from '../../../test-utils.js';

vi.mock('get-user-locale', () => ({
  getUserLocales: vi.fn(),
}));

const languageFiles = {
  'de-DE': {},
  'es-ES': {},
};

describe('useLocale() hook', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('lang');

    vi.clearAllMocks();

    vi.mocked(getUserLocales).mockReturnValue([]);
  });

  it('throws when rendered without TProvider context', async () => {
    muteConsole();

    await expect(renderHook(() => useLocale())).rejects.toThrowError(
      'Invariant failed: Unable to find TProvider context. Did you wrap your app in <TProvider />?',
    );

    restoreConsole();
  });

  it('returns null when no locale can be resolved', async () => {
    const { result } = await renderHook(() => useLocale(), { wrapper: TProvider });

    expect(result.current).toBeNull();
  });

  it('returns locale matching document language', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return <TProvider languageFiles={languageFiles}>{children}</TProvider>;
    }

    const { result } = await renderHook(() => useLocale(), { wrapper });

    expect(result.current).toBe('de-DE');
  });

  it('prefers locale prop over document language', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <TProvider languageFiles={languageFiles} locale="es-ES">
          {children}
        </TProvider>
      );
    }

    const { result } = await renderHook(() => useLocale(), { wrapper });

    expect(result.current).toBe('es-ES');
  });

  it('falls back to defaultLocale when nothing matches', async () => {
    document.documentElement.setAttribute('lang', 'fr-FR');
    vi.mocked(getUserLocales).mockReturnValue(['it-IT']);

    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <TProvider defaultLocale="en-US" languageFiles={{ 'de-DE': {} }}>
          {children}
        </TProvider>
      );
    }

    const { result } = await renderHook(() => useLocale(), { wrapper });

    expect(result.current).toBe('en-US');
  });
});
