import GameClientRequest from "../shared/game/GameClientRequest";
import GameClientRequestMap from "../shared/game/GameClientRequestMap";
import GameContext from "./context/GameContext";
import GameUser from "./user/models/GameUser";
import NetworkSystem from "./system/NetworkSystem";
import { getLogger } from "@yingyeothon/slack-logger";
import putRandomCard from "./context/putRandomCard";

interface ProcessParams<R> {
  user: GameUser;
  request: R;
  context: GameContext;
  network: NetworkSystem;
}

const logger = getLogger("processChange", __filename);

// TODO
const handlers: {
  [T in keyof GameClientRequestMap]: (
    env: ProcessParams<GameClientRequestMap[T]>
  ) => Promise<unknown>;
} = {
  pickCard: async function ({ user, request, context }) {
    if (context.turn !== user.index) {
      logger.debug({ request, user }, "It is not my turn");
      return;
    }
    const me = user;
    const enemy =
      context.user1.index === user.index ? context.user2 : context.user1;
    if (!me.cards.includes(request.payload.cardIndex)) {
      logger.debug({ request, user }, "I'm not have that card");
      return;
    }
    me.cards = dropCard(me.cards, request.payload.cardIndex);
    enemy.hp -= 10;

    logger.info({ request, me, enemy }, "Shot the card");
    context.turn = enemy.index;
  },
};

function dropCard(deck: number[], card: number): number[] {
  const newDeck: number[] = [];
  let dropped = false;
  for (const each of deck) {
    if (!dropped && each === card) {
      dropped = true;
    } else {
      newDeck.push(each);
    }
  }
  return putRandomCard(newDeck);
}

export default async function processChange(
  params: ProcessParams<GameClientRequest>
): Promise<void> {
  const handler = handlers[params.request.type];
  if (handler) {
    await handler(params);
  }
}
