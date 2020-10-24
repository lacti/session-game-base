import GameContext from "./GameContext";
import GameUser from "../user/models/GameUser";

export default function newGameContext([
  user1,
  user2,
]: GameUser[]): GameContext {
  return { turn: user1.index, user1, user2 };
}
