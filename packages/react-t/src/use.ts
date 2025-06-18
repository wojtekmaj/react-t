/// <reference types="react/canary" />
import React from 'react';

type Usable<T> = Promise<T> | React.Context<T>;

const STATUS = {
  PENDING: 'pending',
  REJECTED: 'rejected',
  FULFILLED: 'fulfilled',
} as const;

type TState<T> =
  | { status: typeof STATUS.PENDING; promise: Promise<void> }
  | { status: typeof STATUS.REJECTED; error: Error }
  | { status: typeof STATUS.FULFILLED; result: T };

// biome-ignore lint/suspicious/noExplicitAny: Impossible to type
const states = new Map<Promise<unknown>, TState<any>>();

function usePromiseFallback<T>(usable: Promise<T>): T {
  const existingState = states.get(usable);

  const state: TState<T> =
    existingState ||
    (() => {
      const promise = usable
        .then((data) => {
          states.set(usable, {
            status: STATUS.FULFILLED,
            result: data,
          });
        })
        .catch((error) => {
          states.set(usable, {
            status: STATUS.REJECTED,
            error,
          });
        });

      const newState: TState<T> = { status: 'pending', promise: promise };
      states.set(usable, newState);
      return newState;
    })();

  switch (state.status) {
    case STATUS.PENDING:
      // Suspend the component while fetching
      throw state.promise;
    case STATUS.REJECTED:
      // Result is an error
      throw state.error;
    case STATUS.FULFILLED:
      // Result is a fulfilled promise
      return state.result;
  }
}

function useContextFallback<T>(context: React.Context<T>) {
  // biome-ignore lint/correctness/useHookAtTopLevel: We know that usable will never change
  return React.useContext(context);
}

function useFallback<T>(usable: Usable<T>): T {
  if (usable instanceof Promise) {
    // biome-ignore lint/correctness/useHookAtTopLevel: We know that usable will never change
    return usePromiseFallback(usable);
  }

  // biome-ignore lint/correctness/useHookAtTopLevel: We know that usable will never change
  return useContextFallback(usable);
}

const use: <T>(usable: Usable<T>) => T = React.use || useFallback;

export default use;
