import React, { useRef } from 'react';
import PropTypes from 'prop-types';

type LocaleOptionsProps = {
  locale: string | undefined;
  setLocale: (locale: string | undefined) => void;
};

export default function LocaleOptions({ locale, setLocale }: LocaleOptionsProps) {
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
          id="localeDefault"
          name="locale"
          onChange={onChange}
          type="radio"
          value="undefined"
        />
        <label htmlFor="localeDefault">Auto</label>
      </div>
      <div>
        <input
          checked={locale === 'en'}
          id="localeEn"
          name="locale"
          onChange={onChange}
          type="radio"
          value="en"
        />
        <label htmlFor="localeEn">en (default)</label>
      </div>
      <div>
        <input
          checked={locale === 'de'}
          id="localeDe"
          name="locale"
          onChange={onChange}
          type="radio"
          value="de"
        />
        <label htmlFor="localeDe">de</label>
      </div>
      <div>
        <input
          checked={locale === 'es'}
          id="localeEs"
          name="locale"
          onChange={onChange}
          type="radio"
          value="es"
        />
        <label htmlFor="localeEs">es</label>
      </div>
      <div>
        <input
          checked={locale === 'pl'}
          id="localePl"
          name="locale"
          onChange={onChange}
          type="radio"
          value="pl"
        />
        <label htmlFor="localePl">pl (not supported)</label>
      </div>
      <form onSubmit={onCustomChange}>
        <label htmlFor="customLocale">Custom locale:</label>
        &nbsp;
        <input
          key={locale}
          defaultValue={locale}
          id="customLocale"
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

LocaleOptions.propTypes = {
  locale: PropTypes.string,
  setLocale: PropTypes.func.isRequired,
};
