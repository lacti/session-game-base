import GameStage from "../../GameStage";

export default interface StageBroadcast {
  type: "stage";
  stage: GameStage;
  age: number;
}
