import type {
  Module,
  LanguageFile,
  LanguageFileModule,
  GetterOrLanguageFile,
} from '../shared/types.js';

function resolveModule<T extends object | undefined>(module: Module<T>): T {
  return module && 'default' in module ? module.default : module;
}

function resolveLanguageFileModuleSync(
  getterOrLanguageFile?: GetterOrLanguageFile,
): LanguageFileModule | undefined {
  if (getterOrLanguageFile instanceof Function) {
    const promiseOrLanguageFile = getterOrLanguageFile();

    if (promiseOrLanguageFile instanceof Promise) {
      return undefined;
    }

    return promiseOrLanguageFile;
  }

  return getterOrLanguageFile;
}

export function resolveLanguageFileSync(
  getterOrLanguageFile?: GetterOrLanguageFile,
): LanguageFile | undefined {
  return resolveModule(resolveLanguageFileModuleSync(getterOrLanguageFile));
}

function resolveLanguageFileModule(
  getterOrLanguageFile?: GetterOrLanguageFile,
): Promise<LanguageFileModule | undefined> {
  if (getterOrLanguageFile instanceof Function) {
    const promiseOrLanguageFile = getterOrLanguageFile();

    if (promiseOrLanguageFile instanceof Promise) {
      return promiseOrLanguageFile;
    }

    return Promise.resolve(promiseOrLanguageFile);
  }

  return Promise.resolve(getterOrLanguageFile);
}

export function resolveLanguageFile(
  getterOrLanguageFile?: GetterOrLanguageFile,
): Promise<LanguageFile | undefined> {
  return resolveLanguageFileModule(getterOrLanguageFile).then(resolveModule);
}
