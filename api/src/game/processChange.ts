import GameContext from "./context/GameContext";
import GameRequest from "../shared/game/GameRequest";
import GameUser from "./user/models/GameUser";
import NetworkSystem from "./system/NetworkSystem";

interface ProcessParams<R> {
  user: GameUser;
  request: R;
  context: GameContext;
  network: NetworkSystem;
}

// TODO
const handlers: Partial<
  {
    [type in GameRequest["type"]]: (
      env: ProcessParams<unknown>
    ) => Promise<unknown> | undefined;
  }
> = {};

export default async function processChange(
  params: ProcessParams<GameRequest>
): Promise<void> {
  const handler = handlers[params.request.type];
  if (handler) {
    await handler(params);
  }
}
