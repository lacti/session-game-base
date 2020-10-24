import GameUser from "./models/GameUser";
import User from "./models/User";

export default function gameUserToUser({ index, color }: GameUser): User {
  return {
    index,
    color,
  };
}
