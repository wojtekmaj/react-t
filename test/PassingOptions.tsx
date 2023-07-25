import React from 'react';

import type { PassMethod } from './shared/types';

type PassingOptionsProps = {
  passMethod: PassMethod;
  setPassMethod: (value: PassMethod) => void;
};

export default function PassingOptions({ passMethod, setPassMethod }: PassingOptionsProps) {
  function onPassMethodChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextPassMethod = event.target.value;

    setPassMethod(nextPassMethod as PassMethod);
  }

  return (
    <fieldset>
      <legend>Passing options</legend>

      <div>
        <input
          checked={passMethod === 'attribute'}
          id="passAttribute"
          name="passMethod"
          onChange={onPassMethodChange}
          type="radio"
          value="attribute"
        />
        <label htmlFor="passAttribute">Pass as an HTML attribute</label>
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
        <label htmlFor="passProp">Pass as a prop</label>
      </div>
    </fieldset>
  );
}
