import GlobalStateValue from "./models/GlobalStateValue";
import globalStateContext from "./globalStateContext";

export default function getGlobalStateValue<K extends keyof GlobalStateValue>(
  accessor: K
): GlobalStateValue[K] {
  return globalStateContext[accessor];
}
