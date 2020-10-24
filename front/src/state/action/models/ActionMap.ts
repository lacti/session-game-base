import PickCardAction from "./PickCardAction";
import ServerResponseAction from "./ServerResponseAction";

type ActionMap = {
  serverResponse: ServerResponseAction;
  pickCard: PickCardAction;
};

export default ActionMap;
