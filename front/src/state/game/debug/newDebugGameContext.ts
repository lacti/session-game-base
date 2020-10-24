import GameContext from "../models/GameContext";
import GameStage from "../models/GameStage";

export default function newDebugGameContext(): GameContext {
  return {
    age: 0,
    stage: GameStage.Running,
    world: {
      me: {
        index: 1,
        color: "#123456",
        hp: 100,
        cards: [1, 2, 3, 4, 5],
      },
      enemy: {
        index: 2,
        color: "#567890",
        hp: 100,
        cards: [6, 7, 8, 9, 0],
      },
    },
  };
}
