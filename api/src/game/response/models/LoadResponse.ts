import GameStage from "../../GameStage";
import User from "../../user/models/User";

interface UserLoadResponse {
  type: "load";
  me: User;
  users: User[];
  stage: GameStage;
  age: number;
}

interface ObserveLoadResponse {
  type: "load";
  users: User[];
  stage: GameStage;
  age: number;
  observer: true;
}

type LoadResponse = UserLoadResponse | ObserveLoadResponse;

export default LoadResponse;
