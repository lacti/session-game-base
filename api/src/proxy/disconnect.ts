import { flushSlack, getLogger } from "@yingyeothon/slack-logger";

import { APIGatewayProxyHandler } from "aws-lambda";
import actorEnqueue from "@yingyeothon/actor-system/lib/actor/enqueue";
import actorRedisPush from "@yingyeothon/actor-system-redis-support/lib/queue/push";
import actorSubsysKeys from "../shared/actor/actorSubsysKeys";
import asYlogger from "@yingyeothon/slack-logger/lib/asYlogger";
import env from "./support/env";
import redisDel from "@yingyeothon/naive-redis/lib/del";
import redisGet from "@yingyeothon/naive-redis/lib/get";
import responses from "./support/responses";
import useRedis from "./support/useRedis";

const logger = getLogger("handle:disconnect", __filename);

export const handle: APIGatewayProxyHandler = async (event) => {
  // Read gameId related this connectionId.
  const { connectionId } = event.requestContext;

  try {
    await useRedis(async (redisConnection) => {
      const gameId: string | null = await redisGet(
        redisConnection,
        env.redisKeyPrefixOfConnectionIdAndGameId + connectionId
      );
      logger.info({ connectionId, gameId }, `Game id`);

      // Send a leave message to Redis Q and delete (gameId, connectionId).
      if (gameId) {
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
          { item: { type: "leave", connectionId } }
        );
        await redisDel(
          redisConnection,
          env.redisKeyPrefixOfConnectionIdAndGameId + connectionId
        );
      }

      logger.info({ connectionId, gameId }, `Cleanup and game leaved`);
    });
    return responses.OK;
  } finally {
    await flushSlack();
  }
};
