import EndResponse from "./EndResponse";
import LoadResponse from "./LoadResponse";
import StageResponse from "./StageResponse";

type GameResponse = StageResponse | EndResponse | LoadResponse;

export default GameResponse;
