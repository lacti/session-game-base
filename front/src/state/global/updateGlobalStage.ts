import GlobalStage from "./models/GlobalStage";
import updateGlobalState from "./updateGlobalState";

export default function updateGlobalStage(stage: GlobalStage) {
  updateGlobalState({
    stage,
  });
}
