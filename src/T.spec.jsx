import React from 'react';
import { act, render, screen } from '@testing-library/react';

import T from './T';
import TProvider from './TProvider';

import { muteConsole, restoreConsole } from '../test-utils';

const languageFiles = {
  'de-DE': ({ 'Hello world!': 'Hallo Welt!' }),
  'es-ES': ({ 'Hello world!': '¡Hola Mundo!' }),
};

const syncLanguageFiles = {
  'de-DE': () => ({ 'Hello world!': 'Hallo Welt!' }),
  'es-ES': () => ({ 'Hello world!': '¡Hola Mundo!' }),
};

const asyncLanguageFiles = {
  'de-DE': () => new Promise((resolve) => resolve({ 'Hello world!': 'Hallo Welt!' })),
  'es-ES': () => new Promise((resolve) => resolve({ 'Hello world!': '¡Hola Mundo!' })),
};

jest.mock('lodash.once', () => (fn) => fn);

describe('<T /> component', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('lang');
  });

  it('throws when rendered without TProvider context', () => {
    muteConsole();

    expect(() => render(
      <T />,
    )).toThrowError();

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

    render(
      <TProvider languageFiles={languageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(await screen.findByText('Hallo Welt!')).toBeInTheDocument();
  });

  it('returns translated phrase if html lang is given and synchronous functions returning language files are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    render(
      <TProvider languageFiles={syncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(await screen.findByText('Hallo Welt!')).toBeInTheDocument();
  });

  it('returns translated phrase if html lang is given and asynchronous functions returning language files are given', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    render(
      <TProvider languageFiles={asyncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(await screen.findByText('Hallo Welt!')).toBeInTheDocument();
  });

  it('changes translated phrase if html lang is changed', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    render(
      <TProvider languageFiles={asyncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(await screen.findByText('Hallo Welt!')).toBeInTheDocument();

    act(() => {
      document.documentElement.setAttribute('lang', 'es-ES');
    });

    expect(await screen.findByText('¡Hola Mundo!')).toBeInTheDocument();
  });

  it('changes translated phrase if html lang is changed to value equal to defaultLanguage', async () => {
    document.documentElement.setAttribute('lang', 'de-DE');

    render(
      <TProvider languageFiles={asyncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(await screen.findByText('Hallo Welt!')).toBeInTheDocument();

    act(() => {
      document.documentElement.setAttribute('lang', 'en-US');
    });

    expect(await screen.findByText('Hello world!')).toBeInTheDocument();
  });

  it('returns original phrase if browser language is given but no languageFiles were given', () => {
    muteConsole();

    const languageGetter = jest.spyOn(window.navigator, 'language', 'get');
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

  it('returns translated phrase in browser language is given', async () => {
    const languageGetter = jest.spyOn(window.navigator, 'language', 'get');
    languageGetter.mockReturnValue('de-DE');

    render(
      <TProvider languageFiles={asyncLanguageFiles}>
        <T>Hello world!</T>
      </TProvider>,
    );

    expect(await screen.findByText('Hallo Welt!')).toBeInTheDocument();

    languageGetter.mockRestore();
  });
});
