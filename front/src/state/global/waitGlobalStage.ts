import GlobalStage from "./models/GlobalStage";
import globalStateContext from "./globalStateContext";
import sleep from "../../utils/sleep";

export default async function waitGlobalStage(
  expected: GlobalStage,
  waitIntervalMillis: number = 100
) {
  while (globalStateContext.stage !== expected) {
    await sleep(waitIntervalMillis);
  }
}
