import GameClientRequest from "../shared/game/GameClientRequest";
import GameRequest from "../shared/game/GameRequest";

export default function filterClientRequest(
  requests: GameRequest[]
): GameClientRequest[] {
  return requests
    .filter((req) => req.type !== "enter" && req.type !== "leave")
    .map((req) => req as GameClientRequest);
}
