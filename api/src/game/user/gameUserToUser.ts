import GameUser from "./models/GameUser";

export default function gameUserToUser({ index, color }: GameUser) {
  return {
    index,
    color,
  };
}
