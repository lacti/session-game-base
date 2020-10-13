import defaultRequestSender from "./defaultRequestSender";
import updateGlobalState from "./updateGlobalState";

export default function resetGameContext() {
  updateGlobalState({
    currentGameId: null,
    send: defaultRequestSender,
  });
}
