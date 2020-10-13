import User from "../../user/models/User";

export default interface EnterBroadcast {
  type: "enter";
  newbie: User;
}
