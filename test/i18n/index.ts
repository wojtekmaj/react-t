export const defaultLocale = 'en';

export const languageFiles = {
  de: () => import('./de.json'),
  es: () => import('./es.json'),
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const delayedLanguageFiles = {
  de: () =>
    import('./de.json').then(async (module) => {
      await sleep(1000);

      return module;
    }),
  es: () =>
    import('./es.json').then(async (module) => {
      await sleep(1000);

      return module;
    }),
};
