import { useId } from 'react';

import type { PassMethod } from './shared/types.js';

type OptionsProps = {
  delay: boolean;
  passMethod: PassMethod;
  suspend: boolean;
  setDelay: (value: boolean) => void;
  setPassMethod: (value: PassMethod) => void;
  setSuspend: (value: boolean) => void;
};

export default function Options({
  delay,
  passMethod,
  suspend,
  setDelay,
  setPassMethod,
  setSuspend,
}: OptionsProps) {
  const delayId = useId();
  const suspendId = useId();
  const passAttributeId = useId();
  const passPropId = useId();
  const passMethodLabelId = useId();

  function onDelayChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { checked } = event.target;

    setDelay(checked);
  }

  function onSuspendChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { checked } = event.target;

    setSuspend(checked);
  }

  function onPassMethodChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextPassMethod = event.target.value;

    setPassMethod(nextPassMethod as PassMethod);
  }

  return (
    <fieldset>
      <legend>Options</legend>

      <div>
        <input checked={delay} id={delayId} name="delay" onChange={onDelayChange} type="checkbox" />
        <label htmlFor={delayId}>Delay</label>
      </div>

      <div>
        <input
          checked={suspend}
          id={suspendId}
          name="suspend"
          onChange={onSuspendChange}
          type="checkbox"
        />
        <label htmlFor={suspendId}>Suspend on loading</label>
      </div>

      <label htmlFor={passMethodLabelId}>
        Pass <code>lang</code> as…
      </label>
      <div>
        <input
          checked={passMethod === 'attribute'}
          id={passAttributeId}
          name="passMethod"
          onChange={onPassMethodChange}
          type="radio"
          value="attribute"
        />
        <label htmlFor={passAttributeId}>HTML attribute</label>
      </div>
      <div>
        <input
          checked={passMethod === 'prop'}
          id={passPropId}
          name="passMethod"
          onChange={onPassMethodChange}
          type="radio"
          value="prop"
        />
        <label htmlFor={passPropId}>Prop</label>
      </div>
    </fieldset>
  );
}
