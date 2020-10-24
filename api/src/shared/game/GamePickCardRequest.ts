import ClickPickCardRequest from "../client/ClickPickCardRequest";
import GameConnectionIdRequest from "./GameConnectionIdRequest";

export default interface GamePickCardRequest
  extends GameConnectionIdRequest,
    ClickPickCardRequest {}
