import GameStart from "./models/GameStart";

export default function buildGameConnectionUrl({
  url,
  gameId,
  playerId,
}: GameStart) {
  return `${url}?x-game-id=${gameId}&x-member-id=${playerId}`;
}
