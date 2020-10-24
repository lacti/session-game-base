import User from "../../user/models/User";

export default interface LeaveBroadcast {
  type: "leave";
  payload: {
    leaver: User;
  };
}
