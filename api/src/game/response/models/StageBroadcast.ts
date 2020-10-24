import GameStage from "../../GameStage";

export default interface StageBroadcast {
  type: "stage";
  payload: {
    stage: GameStage;
    age: number;
  };
}
