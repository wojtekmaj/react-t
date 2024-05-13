import type { PassMethod } from './shared/types.js';

type OptionsProps = {
  delay: boolean;
  passMethod: PassMethod;
  setDelay: (value: boolean) => void;
  setPassMethod: (value: PassMethod) => void;
};

export default function Options({ delay, passMethod, setDelay, setPassMethod }: OptionsProps) {
  function onDelayChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { checked } = event.target;

    setDelay(checked);
  }

  function onPassMethodChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextPassMethod = event.target.value;

    setPassMethod(nextPassMethod as PassMethod);
  }

  return (
    <fieldset>
      <legend>Options</legend>

      <div>
        <input checked={delay} id="delay" name="delay" onChange={onDelayChange} type="checkbox" />
        <label htmlFor="delay">Delay</label>
      </div>

      <label htmlFor="passMethod">
        Pass <code>lang</code> as…
      </label>
      <div>
        <input
          checked={passMethod === 'attribute'}
          id="passAttribute"
          name="passMethod"
          onChange={onPassMethodChange}
          type="radio"
          value="attribute"
        />
        <label htmlFor="passAttribute">HTML attribute</label>
      </div>
      <div>
        <input
          checked={passMethod === 'prop'}
          id="passProp"
          name="passMethod"
          onChange={onPassMethodChange}
          type="radio"
          value="prop"
        />
        <label htmlFor="passProp">Prop</label>
      </div>
    </fieldset>
  );
}
