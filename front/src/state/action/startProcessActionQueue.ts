import dispatch from "./dispatch";
import q from "./q";
import sleep from "../../utils/sleep";

export default async function startProcessActionQueue({
  inputDelay = 50,
}: {
  inputDelay?: number;
} = {}) {
  while (true) {
    const action = q.shift();
    if (action === undefined) {
      // Reduce the CPU usage when a game is not running.
      await sleep(inputDelay);
      continue;
    }

    dispatch[action.type](action as any);
  }
}
