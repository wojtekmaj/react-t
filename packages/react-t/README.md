[![npm](https://img.shields.io/npm/v/@wojtekmaj/react-t.svg)](https://www.npmjs.com/package/@wojtekmaj/react-t) ![downloads](https://img.shields.io/npm/dt/@wojtekmaj/react-t.svg) [![CI](https://github.com/wojtekmaj/react-t/actions/workflows/ci.yml/badge.svg)](https://github.com/wojtekmaj/react-t/actions)

# React-T

Simple translation module for React applications.

## tl;dr

- Install by executing `npm install @wojtekmaj/react-t` or `yarn add @wojtekmaj/react-t`.
- Setup by adding `import { TProvider } from '@wojtekmaj/react-t'` and wrapping your app in `<TProvider />`.
- Add languages by creating a JSON file, like this:
  ```json
  {
    "Hello world!": "Hallo Welt!"
  }
  ```
  and adding `languageFiles` to `<TProvider />`, like this:
  ```tsx
  <TProvider languageFiles={{ 'de-DE': () => import('./de-DE.json') }} />
  ```
- Use by adding `import T from '@wojtekmaj/react-t'` and wrapping your text in `<T />`.

## Getting started

### Compatibility

Your project needs to use React 16.8 or later.

React-T is also compatible with React Native.

### Installation

Add React-T to your project by executing `npm install @wojtekmaj/react-t` or `yarn add @wojtekmaj/react-t`.

### Setting up

Here's an example of basic setup:

```ts
import { createRoot } from 'react-dom/client';
import { TProvider } from '@wojtekmaj/react-t';

import Root from './Root';

const languageFiles = {
  'de-DE': () => import('./de-DE.json'),
};

createRoot(document.getElementById('react-root')).render(
  <TProvider languageFiles={languageFiles}>
    <Root />
  </TProvider>,
);
```

### Usage

Here's an example of basic usage:

```ts
import T from '@wojtekmaj/react-t';

function MyComponent() {
  return (
    <p>
      <T>Hello world!</T>
    </p>
  );
}
```

### How the locale is detected?

React-T detects locale to use by going through the list of possible sources:

1. `locale` prop provided to `<TProvider />`
2. `<html lang="…">` attribute
3. List of preferred user locales obtained using [`get-user-locale`](https://github.com/wojtekmaj/get-user-locale)

On each step, React-T checks if a given locale is supported (provided in `languageFiles`, or defined as `defaultLocale`). If a given locale is supported, it'll use it. If not, it'll move to the next step on the list.

If no supported locale is detected, `defaultLocale` is used (no translation is being made).

## User guide

### Usage of `TProvider` component

Wrap your app in `<TProvider />`.

Define `languageFiles` prop that contains an object of:

- functions that return promises:
  ```ts
  {
    'de-DE': () => import('./myLanguageFile.json'),
  }
  ```
- functions that return language files:
  ```ts
  {
    'de-DE': () => myLanguageFile,
  }
  ```
- language files:
  ```ts
  {
    'de-DE': myLanguageFile,
  }
  ```

### Usage of the `T` component:

Define translatable string in the code using `<T>` tag:

```ts
<T>Original phrase</T>
```

If necessary, you may use variables like so:

```ts
<T name={name}>{'Hello, {name}'}</T>
```

### Usage of the `useTranslation` hook

Define translatable string in the code using `useTranslation` hook:

```ts
const translatedPhrase = useTranslation('Original phrase');
```

If necessary, you may use variables like so:

```ts
const translatedPhrase = useTranslation('Hello, {name}', { name });
```

### Translating strings

2. If you're a translator, add a corresponding entry in language JSON files, for example:

```json
{
  "Hello world!": "Hallo Welt!"
}
```

If a corresponding entry in language file for current locale is not found, default locale will be used.

## License

The MIT License.

## Author

<table>
  <tr>
    <td >
      <img src="https://avatars.githubusercontent.com/u/5426427?v=4&s=128" width="64" height="64" alt="Wojciech Maj">
    </td>
    <td>
      <a href="https://github.com/wojtekmaj">Wojciech Maj</a>
    </td>
  </tr>
</table>
