[![npm](https://img.shields.io/npm/v/@wojtekmaj/react-t.svg)](https://www.npmjs.com/package/@wojtekmaj/react-t) ![downloads](https://img.shields.io/npm/dt/@wojtekmaj/react-t.svg) [![CI](https://github.com/wojtekmaj/react-t/workflows/CI/badge.svg)](https://github.com/wojtekmaj/react-t/actions) ![dependencies](https://img.shields.io/david/wojtekmaj/react-t.svg) ![dev dependencies](https://img.shields.io/david/dev/wojtekmaj/react-t.svg) [![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

# React-T

Simple translation module for React applications.

## tl;dr
* Install by executing `npm install @wojtekmaj/react-t` or `yarn add @wojtekmaj/react-t`.
* Setup by adding `import { TProvider } from '@wojtekmaj/react-t'` and wrapping your app in `<TProvider />`.
* Add languages by creating a JSON file, like this:
  ```json
  {
    "Hello world!": "Hallo Welt!"
  }
  ```
  and adding `languageFiles` to `<TProvider />`, like this:
  ```js
  <TProvider languageFiles={{ 'de-DE': () => import('./de-DE.json') }} />
  ```
* Use by adding `import T from '@wojtekmaj/react-t'` and wrapping your text in  `<T />`.

## Getting started

### Compatibility

Your project needs to use React 16.8 or later.

### Installation

Add React-T to your project by executing `npm install @wojtekmaj/react-t` or `yarn add @wojtekmaj/react-t`.

### Setting up

Here's an example of basic setup:

```js
import React from 'react';
import { render } from 'react-dom';
import { TProvider } from '@wojtekmaj/react-t';

import Root from './Root';

const languageFiles = {
  'de-DE': () => import('./de-DE.json'),
};

render(
  <TProvider languageFiles={languageFiles}>
    <Root />
  </TProvider>,
  document.getElementById('react-root'),
);
```

### Usage

Here's an example of basic usage:

```js
import React from 'react';
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

#### Variant 1

`<html lang="…">` attribute is read. If provided, React-T will use this locale, provided that it's supported (provided in `languageFiles`). Otherwise, default locale is used.

#### Variant 2

If `<html lang="…">` attribute is not provided the following happens:

* A list of preferred user locales is created using [`get-user-locale`](https://github.com/wojtekmaj/get-user-locale).
* A list of supported user locales is constructed from `languageFiles` prop provided to `<TProvider />`.
* Each locale from the list of preferred user locales is checked whether it is supported or not. When a match is found React-T will use this locale. Otherwise, default locale is used.

## User guide

### Usage of `TProvider` component

Wrap your app in `<TProvider />`.

Define `languageFiles` prop that contains an object of:

* functions that return promises:
    ```js
    {
      'de-DE': () => import('./myLanguageFile.json'),
    }
    ```
* functions that return language files:
    ```js
    {
      'de-DE': () => myLanguageFile,
    }
    ```
* language files:
    ```js
    {
      'de-DE': myLanguageFile,
    }
    ```

### Usage of the `T` component:

Define translatable string in the code using `<T>` tag:

```js
<T>Original phrase</T>
```

If necessary, you may use variables like so:

```js
<T name={name}>{'Hello, {name}'}</T>
```

### Usage of the `useTranslation` hook

Define translatable string in the code using `useTranslation` hook:

```js
const translatedPhrase = useTranslation('Original phrase');
```

If necessary, you may use variables like so:

```js
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
    <td>
      <img src="https://github.com/wojtekmaj.png?s=100" width="100">
    </td>
    <td>
      Wojciech Maj<br />
      <a href="mailto:kontakt@wojtekmaj.pl">kontakt@wojtekmaj.pl</a><br />
      <a href="http://wojtekmaj.pl">http://wojtekmaj.pl</a>
    </td>
  </tr>
</table>
