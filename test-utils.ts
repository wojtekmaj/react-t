/* eslint-env jest */

export function muteConsole() {
  jest.spyOn(global.console, 'log').mockImplementation(() => {
    // Intentionally empty
  });
  jest.spyOn(global.console, 'error').mockImplementation(() => {
    // Intentionally empty
  });
  jest.spyOn(global.console, 'warn').mockImplementation(() => {
    // Intentionally empty
  });
}

export function restoreConsole() {
  jest.mocked(global.console.log).mockRestore();
  jest.mocked(global.console.error).mockRestore();
  jest.mocked(global.console.warn).mockRestore();
}