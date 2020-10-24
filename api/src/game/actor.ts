import { flushSlack, getLogger } from "@yingyeothon/slack-logger";

import Game from "./Game";
import GameActorStartEvent from "../shared/actor/GameActorStartEvent";
import GameRequest from "../shared/game/GameRequest";
import { Handler } from "aws-lambda";
import actorEventLoop from "@yingyeothon/actor-system/lib/actor/eventLoop";
import actorSubsys from "./actorSubsys";
import clearActorStartEvent from "../shared/actor/clearActorStartEvent";
import constants from "./constants";
import readyCall from "../lobby/readyCall";
import redisConnection from "./redisConnection";
import redisDel from "@yingyeothon/naive-redis/lib/del";
import redisSet from "@yingyeothon/naive-redis/lib/set";
import saveActorStartEvent from "../shared/actor/saveActorStartEvent";

const logger = getLogger("handle:actor", __filename);

export const handle: Handler<GameActorStartEvent, void> = async (event) => {
  logger.info({ event }, `Start a new game lambda`);

  try {
    const { gameId, members } = event;
    if (!gameId) {
      logger.error({ event }, `No gameId from payload`);
      return;
    }

    // First, store game context into Redis.
    await saveActorStartEvent({
      event,
      set: (key, value) =>
        redisSet(redisConnection, key, value, {
          expirationMillis: constants.gameAliveSeconds * 1000,
        }),
    });

    // Start the game loop.
    await actorEventLoop<GameRequest>({
      ...actorSubsys,
      id: gameId,
      loop: async (poll) => {
        logger.info({ gameId, members }, `Start a game with id`);
        const game = new Game(gameId, members, async () => {
          const messages = await poll();
          if (messages.length > 0) {
            logger.info({ messages }, `Process game messages`);
          }
          return messages;
        });
        try {
          // Send the ready signal to the Lobby.
          if (event.callbackUrl !== undefined) {
            const response = await readyCall(event.callbackUrl);
            logger.info({ response }, `Mark this game as ready`);
          }

          await game.run();
        } catch (error) {
          logger.error({ gameId, error }, `Unexpected error from game`);
        }
        logger.info({ gameId, members }, `End of the game`);
        await clearActorStartEvent({
          gameId,
          del: (key) => redisDel(redisConnection, key),
        });
      },
    });
  } finally {
    await flushSlack();
  }
};
