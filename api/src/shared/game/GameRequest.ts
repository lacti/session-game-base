import GameEnterRequest from "./GameEnterRequest";
import GameLeaveRequest from "./GameLeaveRequest";
import GamePickCardRequest from "./GamePickCardRequest";

type GameRequest = GameEnterRequest | GameLeaveRequest | GamePickCardRequest;

export default GameRequest;
