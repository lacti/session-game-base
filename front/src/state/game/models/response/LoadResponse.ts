import GameUser from "../GameUser";

export default interface LoadResponse {
  type: "load";
  payload: {
    me: GameUser;
    enemy: GameUser;
  };
}
