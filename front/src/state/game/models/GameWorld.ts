import GameUser from "./GameUser";

export default interface GameWorld {
  me: GameUser;
  enemy: GameUser;
}
