import GameRequest from "../../game/models/request/GameRequest";

export default interface GlobalStateMethod {
  send: (request: GameRequest) => void;
}
