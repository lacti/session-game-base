import EndResponse from "./EndResponse";
import LoadResponse from "./LoadResponse";
import StageResponse from "./StageResponse";

export default interface GameResponseMap {
  stage: StageResponse;
  end: EndResponse;
  load: LoadResponse;
}
