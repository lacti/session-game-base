import { flushSlack, getLogger } from "@yingyeothon/slack-logger";

import { APIGatewayProxyHandler } from "aws-lambda";
import ClientRequest from "../shared/client/ClientRequest";
import actorEnqueue from "@yingyeothon/actor-system/lib/actor/enqueue";
import actorRedisPush from "@yingyeothon/actor-system-redis-support/lib/queue/push";
import actorSubsysKeys from "../shared/actor/actorSubsysKeys";
import asYlogger from "@yingyeothon/slack-logger/lib/asYlogger";
import env from "./support/env";
import redisConnect from "@yingyeothon/naive-redis/lib/connection";
import redisGet from "@yingyeothon/naive-redis/lib/get";
import responses from "./support/responses";
import validateClientRequest from "../shared/client/validateClientRequest";

const logger = getLogger("handle:message", __filename);

const redisConnection = redisConnect({
  host: env.redisHost,
  password: env.redisPassword,
});

export const handle: APIGatewayProxyHandler = async (event) => {
  const connectionId = event.requestContext.connectionId;

  try {
    // Parse and validate a message from the client.
    let request: ClientRequest | undefined;
    try {
      request = JSON.parse(event.body ?? "{}") as ClientRequest;
      if (!validateClientRequest(request)) {
        throw new Error(`Invalid message: [${event.body}]`);
      }
    } catch (error) {
      logger.error({ connectionId, request, error }, `Invalid message`);
      return responses.NotFound;
    }

    // Read gameId related this connectionId.
    const gameId: string | null = await redisGet(
      redisConnection,
      env.redisKeyPrefixOfConnectionIdAndGameId + connectionId
    );
    logger.info({ connectionId, gameId }, `Game id`);
    if (!gameId) {
      logger.error({ connectionId }, `No GameID for connection`);
      return responses.NotFound;
    }

    // Encode a game message and send it to Redis Q.
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
      { item: { ...request, connectionId } }
    );
    logger.info({ connectionId, gameId, request }, `Game message sent`);
    return responses.OK;
  } finally {
    await flushSlack();
  }
};
