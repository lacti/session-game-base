import GlobalStateMethod from "./models/GlobalStateMethod";
import globalStateContext from "./globalStateContext";

export default function workWithGlobalState<
  K extends keyof GlobalStateMethod,
  R
>(accessor: K, work: (delegate: GlobalStateMethod[K]) => R): R {
  return work(globalStateContext[accessor]);
}
