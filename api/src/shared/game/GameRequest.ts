import GameEnterRequest from "./GameEnterRequest";
import GameLeaveRequest from "./GameLeaveRequest";
import GameLoadRequest from "./GameLoadRequest";

type GameRequest = GameEnterRequest | GameLeaveRequest | GameLoadRequest;

export default GameRequest;
