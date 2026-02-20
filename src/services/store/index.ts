// Mock Redux store that satisfies the required types
export const store: any = {
  getState: () => ({
    project: { current: null },
    simulation: { isRunning: false }
  }),
  dispatch: () => {},
  subscribe: () => () => {},
  replaceReducer: () => {},
  [Symbol.observable]: () => ({
    subscribe: () => ({ unsubscribe: () => {} })
  })
};
