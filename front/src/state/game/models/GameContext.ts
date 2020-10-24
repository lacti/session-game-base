import GameStage from "./GameStage";
import GameWorld from "./GameWorld";

export default interface GameContext {
  stage: GameStage;
  age: number;
  world?: GameWorld;
}
