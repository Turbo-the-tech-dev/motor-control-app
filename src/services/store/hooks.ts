// Mock Redux hooks for stability
export const useAppSelector = (selector: (state: any) => any) => {
  const state = {
    project: { current: null },
    simulation: { isRunning: false }
  };
  return selector(state);
};
export const useAppDispatch = () => () => {};
