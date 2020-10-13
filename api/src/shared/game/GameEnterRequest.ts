import GameConnectionIdRequest from "./GameConnectionIdRequest";

export default interface GameEnterRequest extends GameConnectionIdRequest {
  type: "enter";
  memberId: string;
}
