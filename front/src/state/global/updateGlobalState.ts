import GlobalState from "./models/GlobalState";
import globalStateContext from "./globalStateContext";

export default function updateGlobalState(partial: Partial<GlobalState>) {
  Object.assign(globalStateContext, partial);
}
