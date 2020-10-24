import GameUser from "../user/models/GameUser";

export default interface GameContext {
  turn: number;
  user1: GameUser;
  user2: GameUser;
}
