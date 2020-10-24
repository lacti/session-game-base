import { flushSlack, getLogger } from "@yingyeothon/slack-logger";

import { APIGatewayProxyHandler } from "aws-lambda";
import actorEnqueue from "@yingyeothon/actor-system/lib/actor/enqueue";
import actorRedisPush from "@yingyeothon/actor-system-redis-support/lib/queue/push";
import actorSubsysKeys from "../shared/actor/actorSubsysKeys";
import asYlogger from "@yingyeothon/slack-logger/lib/asYlogger";
import env from "./support/env";
import loadActorStartEvent from "../shared/actor/loadActorStartEvent";
import redisGet from "@yingyeothon/naive-redis/lib/get";
import redisSet from "@yingyeothon/naive-redis/lib/set";
import responses from "./support/responses";
import useRedis from "./support/useRedis";

const expirationMillis = 900 * 1000;
const logger = getLogger("handle:connect", __filename);

export const handle: APIGatewayProxyHandler = async (event) => {
  const { connectionId } = event.requestContext;
  const getParameter = (key: string) =>
    event.headers[key] ?? (event.queryStringParameters ?? {})[key];

  try {
    const response = await useRedis(async (redisConnection) => {
      // A client should send a "X-GAME-ID" via HTTP Header.
      const gameId = getParameter("x-game-id");
      const memberId = getParameter("x-member-id");

      // Validate starting information.
      if (!gameId || !memberId) {
        logger.error({ connectionId }, `Invalid gameId from connection`);
        return responses.NotFound;
      }
      const startEvent = await loadActorStartEvent({
        gameId,
        get: (key) => redisGet(redisConnection, key),
      });
      if (startEvent === null) {
        logger.error(`Invalid game context from gameId`, gameId);
        return responses.NotFound;
      }
      if (startEvent.members.every((m) => m.memberId !== memberId)) {
        logger.error({ startEvent, memberId }, `Not registered member`);
        return responses.NotFound;
      }

      // Register connection and start a game.
      await redisSet(
        redisConnection,
        env.redisKeyPrefixOfConnectionIdAndGameId + connectionId,
        gameId,
        { expirationMillis }
      );

      const yLogger = asYlogger(logger);
      await actorEnqueue(
        {
          id: gameId,
          queue: actorRedisPush({
            connection: redisConnection,
            keyPrefix: actorSubsysKeys.queueKeyPrefix,
            logger: yLogger,
          }),
          logger: yLogger,
        },
        {
          item: {
            type: "enter",
            connectionId,
            memberId,
          },
        }
      );
      logger.info({ gameId, connectionId, memberId }, `Game logged`);
      return responses.OK;
    });
    return response;
  } finally {
    await flushSlack();
  }
};
