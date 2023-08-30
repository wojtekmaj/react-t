import { cloneElement, isValidElement, useContext } from 'react';
import invariant from 'tiny-invariant';

import TContext from './TContext.js';

import type { Args, ArgsOfNodes, ArgsOfStringsOrNumbers, LanguageFile } from './shared/types.js';

function getRawTranslatedString(string: string, languageFile: LanguageFile | undefined): string {
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

    if (isLast) {
      return [...arr, element];
    }

    return [
      ...arr,
      element,
      isValidElement(replacement)
        ? // eslint-disable-next-line react/no-array-index-key
          cloneElement(replacement, { key: `${keyPrefix}-${index}` })
        : replacement,
    ];
  }, initialValue);
}

function applyArgs(string: string, args: ArgsOfStringsOrNumbers): string;
function applyArgs(string: string, args: ArgsOfNodes): React.ReactNode[];
function applyArgs(rawString: string, args: Args): string | React.ReactNode[] {
  let result: React.ReactNode[] = [rawString];

  for (const [argName, replacement] of Object.entries(args || {})) {
    result = result.flatMap((string, index) => {
      return typeof string === 'string'
        ? applyArg(string, argName, replacement, `${index}`)
        : string;
    });
  }

  return result;
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

  const { languageFile } = context;

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
