import type {
  GetterOrLanguageFile,
  LanguageFile,
  LanguageFileModule,
  Module,
} from '../shared/types.js';

function resolveModule<T extends object | null>(module: Module<T>): T {
  return module && 'default' in module ? module.default : module;
}

function resolveLanguageFileModuleSync(
  getterOrLanguageFile: GetterOrLanguageFile | null,
): LanguageFileModule | null {
  if (getterOrLanguageFile instanceof Function) {
    const promiseOrLanguageFile = getterOrLanguageFile();

    if (promiseOrLanguageFile instanceof Promise) {
      return null;
    }

    return promiseOrLanguageFile;
  }

  return getterOrLanguageFile;
}

export function resolveLanguageFileSync(
  getterOrLanguageFile: GetterOrLanguageFile | null,
): LanguageFile | null {
  return resolveModule(resolveLanguageFileModuleSync(getterOrLanguageFile));
}

function resolveLanguageFileModule(
  getterOrLanguageFile: GetterOrLanguageFile | null,
): Promise<LanguageFileModule | null> {
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
  getterOrLanguageFile: GetterOrLanguageFile | null,
): Promise<LanguageFile | null> {
  return resolveLanguageFileModule(getterOrLanguageFile).then(resolveModule);
}
