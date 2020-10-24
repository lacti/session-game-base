import GameUser from "../../user/models/GameUser";

interface UserLoadResponse {
  type: "load";
  payload: {
    me: GameUser;
    enemy: GameUser;
    myTurn: boolean;
  };
}

interface ObserveLoadResponse {
  type: "load";
  payload: {
    users: GameUser[];
    observer: true;
  };
}

type LoadResponse = UserLoadResponse | ObserveLoadResponse;

export default LoadResponse;
