import GameContext from "../../game/models/GameContext";
import GlobalStage from "./GlobalStage";

export default interface GlobalStateValue {
  stage: GlobalStage;
  currentGameId: string | null;
  gameContext: GameContext;
}
