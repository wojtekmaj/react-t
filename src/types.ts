export type ArgsOfStringsOrNumbers = Record<string, string | number>;

export type ArgsOfNodes = Record<string, React.ReactNode>;

export type Args = ArgsOfStringsOrNumbers | ArgsOfNodes;

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
