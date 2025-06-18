import { cloneElement, isValidElement, useContext, useEffect, useState } from 'react';
import invariant from 'tiny-invariant';

import TContext from './TContext.js';

import use from './use.js';

import { resolveLanguageFile, resolveLanguageFileSync } from './utils/resolver.js';

import type {
  Args,
  ArgsOfNodes,
  ArgsOfStringsOrNumbers,
  GetterOrLanguageFile,
  LanguageFile,
} from './shared/types.js';

function getRawTranslatedString(string: string, languageFile: LanguageFile | null): string {
  return languageFile?.[string] ?? string;
}

function applyArg(
  string: string,
  argName: string,
  replacement: string | number,
  keyPrefix: string,
): string;
function applyArg(
  string: string,
  argName: string,
  replacement: React.ReactNode,
  keyPrefix: string,
): React.ReactNode[];
function applyArg(
  string: string,
  argName: string,
  replacement: string | number | React.ReactNode,
  keyPrefix = '',
): string | React.ReactNode[] {
  const placeholder = `{${argName}}`;
  const regExp = new RegExp(placeholder, 'g');

  if (typeof replacement === 'string' || typeof replacement === 'number') {
    const result = string.replace(regExp, `${replacement}`);

    return result;
  }

  const splitString = string.split(placeholder);

  const initialValue: React.ReactNode[] = [];

  return splitString.reduce((arr, element, index) => {
    const isLast = index === splitString.length - 1;

    arr.push(element);

    if (!isLast) {
      arr.push(
        isValidElement(replacement)
          ? // biome-ignore lint/suspicious/noArrayIndexKey: index is stable here
            cloneElement(replacement, { key: `${keyPrefix}-${index}` })
          : replacement,
      );
    }

    return arr;
  }, initialValue);
}

function applyArgs(rawString: string, args: ArgsOfStringsOrNumbers): string;
function applyArgs(rawString: string, args: ArgsOfNodes): React.ReactNode[];
function applyArgs(rawString: string, args: Args): string | React.ReactNode[] {
  let result: React.ReactNode[] = [rawString];

  for (const [argName, replacement] of Object.entries(args || {})) {
    result = result.flatMap((string, index) => {
      return typeof string === 'string'
        ? applyArg(string, argName, replacement, `${index}`)
        : string;
    });
  }

  if (result.length === 1 && typeof result[0] === 'string') {
    return result[0];
  }

  return result;
}

const resolveCache = new Map<GetterOrLanguageFile, Promise<LanguageFile | null>>();

function useLanguageFileSuspense(getterOrLanguageFile: GetterOrLanguageFile | null) {
  if (!getterOrLanguageFile) {
    return null;
  }

  const languageFileSync = resolveLanguageFileSync(getterOrLanguageFile);

  if (languageFileSync) {
    return languageFileSync;
  }

  const promise = (() => {
    if (!resolveCache.has(getterOrLanguageFile)) {
      resolveCache.set(getterOrLanguageFile, resolveLanguageFile(getterOrLanguageFile));
    }

    const cachedPromise = resolveCache.get(getterOrLanguageFile);

    if (!cachedPromise) {
      throw new Error('Unable to find cached promise');
    }

    return cachedPromise;
  })();

  const languageFileAsync = use(promise);

  return languageFileAsync;
}

function useLanguageFileState(getterOrLanguageFile: GetterOrLanguageFile | null) {
  // biome-ignore lint/correctness/useHookAtTopLevel: We know that suspend will never change
  const [languageFile, setLanguageFile] = useState<LanguageFile | null>(
    resolveLanguageFileSync(getterOrLanguageFile),
  );

  // biome-ignore lint/correctness/useHookAtTopLevel: We know that suspend will never change
  useEffect(() => {
    resolveLanguageFile(getterOrLanguageFile).then(setLanguageFile);
  }, [getterOrLanguageFile]);

  return languageFile;
}

export default function useTranslation(string?: undefined, args?: undefined): undefined;
export default function useTranslation(string: undefined, args?: Args): undefined;
export default function useTranslation<T extends string | undefined>(
  string: T,
  args?: undefined,
): T extends string ? string : undefined;
export default function useTranslation<T extends string | undefined>(
  string: T,
  args: ArgsOfStringsOrNumbers,
): T extends string ? string : undefined;
export default function useTranslation<T extends string | undefined>(
  string: T,
  args: ArgsOfNodes,
): T extends string ? React.ReactNode[] : undefined;
export default function useTranslation(
  string?: string,
  args?: Args,
): string | React.ReactNode[] | undefined {
  const context = useContext(TContext);

  invariant(context, 'Unable to find TProvider context. Did you wrap your app in <TProvider />?');

  const { languageFiles, locale, suspend } = context;

  const getterOrLanguageFile =
    (languageFiles && locale && languageFiles[locale] ? languageFiles[locale] : null) || null;

  const languageFile = suspend
    ? // biome-ignore lint/correctness/useHookAtTopLevel: We know that suspend will never change
      useLanguageFileSuspense(getterOrLanguageFile)
    : // biome-ignore lint/correctness/useHookAtTopLevel: We know that suspend will never change
      useLanguageFileState(getterOrLanguageFile);

  if (!string) {
    return string;
  }

  const rawTranslatedString = getRawTranslatedString(string, languageFile);

  if (!args) {
    return rawTranslatedString;
  }

  const stringWithArgs = applyArgs(rawTranslatedString, args);

  return stringWithArgs;
}
