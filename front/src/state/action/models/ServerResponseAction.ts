import GameResponse from "../../game/models/response/GameResponse";

export default interface ServerResponseAction {
  type: "serverResponse";
  payload: GameResponse;
}
