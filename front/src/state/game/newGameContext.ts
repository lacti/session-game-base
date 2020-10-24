import GameContext from "./models/GameContext";
import GameStage from "./models/GameStage";

export default function newGameContext(): GameContext {
  return {
    stage: GameStage.Wait,
    age: 0,
  };
}
