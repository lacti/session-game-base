import GameStage from "../GameStage";

export default interface StageResponse {
  type: "stage";
  payload: {
    stage: GameStage;
  };
}
