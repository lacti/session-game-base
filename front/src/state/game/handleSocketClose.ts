import GlobalStage from "../global/models/GlobalStage";
import getGlobalStage from "../global/getGlobalStage";
import resetGameContext from "../global/resetGameContext";
import updateGlobalStage from "../global/updateGlobalStage";

export default function handleSocketCloseWith(closedCallback: () => void) {
  return () => {
    // Step 2. Anyway, this game is finished but is this intentional situation?
    switch (getGlobalStage()) {
      case GlobalStage.GameError:
      case GlobalStage.GameEnd:
        break;
      default:
        updateGlobalStage(GlobalStage.GameError);
        break;
    }
    // Anyway, this game is over.
    resetGameContext();
    closedCallback();
  };
}
