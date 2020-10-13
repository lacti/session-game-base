import globalStateContext from "./globalStateContext";

export default function getCurrentGameContext() {
  return globalStateContext.gameContext;
}
