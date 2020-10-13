import ClientLoadRequest from "../client/ClientLoadRequest";
import GameConnectionIdRequest from "./GameConnectionIdRequest";

export default interface GameLoadRequest
  extends ClientLoadRequest,
    GameConnectionIdRequest {}
