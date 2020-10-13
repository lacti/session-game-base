import GlobalStage from "../global/models/GlobalStage";
import getGlobalStage from "../global/getGlobalStage";
import updateGlobalStage from "../global/updateGlobalStage";

export default function handleSocketError(event: Event) {
  console.error("Socket has an error", event);
  // Step 3. Transit to error state only if connecting.
  // Because it is ignorable that an error occurred while sending a request.
  if (getGlobalStage() === GlobalStage.GameStarting) {
    updateGlobalStage(GlobalStage.GameError);
  }
  // TODO Should we reconnect this game?
}
