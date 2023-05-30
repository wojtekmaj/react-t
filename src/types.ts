export type Module<T> =
  | T
  | {
      default: T;
    };

export type LanguageFile = Record<string, string>;

export type LanguageFileModule = Module<LanguageFile>;

export type GetterOrLanguageFile =
  | (() => Promise<LanguageFileModule>)
  | (() => LanguageFileModule)
  | LanguageFileModule;

export type LanguageFiles = Record<string, GetterOrLanguageFile>;
