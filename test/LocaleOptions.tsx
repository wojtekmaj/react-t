import { useId, useRef } from 'react';

type LocaleOptionsProps = {
  locale: string | undefined;
  setLocale: (locale: string | undefined) => void;
};

export default function LocaleOptions({ locale, setLocale }: LocaleOptionsProps) {
  const localeDefaultId = useId();
  const localeEnId = useId();
  const localeDeId = useId();
  const localeEsId = useId();
  const localePlId = useId();
  const customLocaleId = useId();
  const customLocale = useRef<HTMLInputElement>(null);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value: nextLocale } = event.target;

    if (nextLocale === 'undefined') {
      setLocale(undefined);
    } else {
      setLocale(nextLocale);
    }
  }

  function onCustomChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = customLocale.current;
    const { value: nextLocale } = input as HTMLInputElement;

    setLocale(nextLocale);
  }

  function resetLocale() {
    setLocale(undefined);
  }

  return (
    <fieldset>
      <legend>Locale</legend>

      <div>
        <input
          checked={locale === undefined}
          id={localeDefaultId}
          name="locale"
          onChange={onChange}
          type="radio"
          value="undefined"
        />
        <label htmlFor={localeDefaultId}>Auto</label>
      </div>
      <div>
        <input
          checked={locale === 'en'}
          id={localeEnId}
          name="locale"
          onChange={onChange}
          type="radio"
          value="en"
        />
        <label htmlFor={localeEnId}>en (default)</label>
      </div>
      <div>
        <input
          checked={locale === 'de'}
          id={localeDeId}
          name="locale"
          onChange={onChange}
          type="radio"
          value="de"
        />
        <label htmlFor={localeDeId}>de</label>
      </div>
      <div>
        <input
          checked={locale === 'es'}
          id={localeEsId}
          name="locale"
          onChange={onChange}
          type="radio"
          value="es"
        />
        <label htmlFor={localeEsId}>es</label>
      </div>
      <div>
        <input
          checked={locale === 'pl'}
          id={localePlId}
          name="locale"
          onChange={onChange}
          type="radio"
          value="pl"
        />
        <label htmlFor={localePlId}>pl (not supported)</label>
      </div>
      <form onSubmit={onCustomChange}>
        <label htmlFor={customLocaleId}>Custom locale:</label>
        &nbsp;
        <input
          key={locale}
          defaultValue={locale}
          id={customLocaleId}
          name="customLocale"
          pattern="^[a-z]{2}(-[A-Z0-9]{2,3})?$"
          ref={customLocale}
          type="text"
        />
        &nbsp;
        <button style={{ display: 'none' }} type="submit">
          Set locale
        </button>
        <button disabled={locale === undefined} onClick={resetLocale} type="button">
          Reset locale
        </button>
      </form>
    </fieldset>
  );
}
