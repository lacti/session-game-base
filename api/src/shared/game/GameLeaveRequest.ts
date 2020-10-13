import GameConnectionIdRequest from "./GameConnectionIdRequest";

export default interface GameLeaveRequest extends GameConnectionIdRequest {
  type: "leave";
}
