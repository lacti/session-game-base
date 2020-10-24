import GameResponseMap from "../game/models/response/GameResponseMap";
import GameStage from "../game/models/GameStage";
import getCurrentGameContext from "../global/getCurrentGameContext";

const dispatchServerMessage: {
  [T in keyof GameResponseMap]: (action: GameResponseMap[T]) => void;
} = {
  stage: function ({ payload: { stage, age } }) {
    const context = getCurrentGameContext();
    context.stage = stage;
    context.age = age;
  },
  end: function () {
    const context = getCurrentGameContext();
    context.stage = GameStage.End;
    context.age = 0;
  },
  load: function ({ payload: { me, enemy } }) {
    const context = getCurrentGameContext();
    context.world = {
      me,
      enemy,
    };
  },
};

export default dispatchServerMessage;
