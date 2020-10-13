import GlobalStage from "./models/GlobalStage";
import GlobalState from "./models/GlobalState";
import defaultRequestSender from "./defaultRequestSender";
import newGameContext from "../game/newGameContext";

const globalStateContext: GlobalState = {
  stage: GlobalStage.Initialized,
  currentGameId: null,
  gameContext: newGameContext(),

  send: defaultRequestSender,
};

export default globalStateContext;
