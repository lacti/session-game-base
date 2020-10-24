import { flushSlack, getLogger } from "@yingyeothon/slack-logger";

import { APIGatewayProxyHandler } from "aws-lambda";
import GameActorStartEvent from "../shared/actor/GameActorStartEvent";
import { Lambda } from "aws-sdk";
import actorSubsysKeys from "../shared/actor/actorSubsysKeys";
import asYlogger from "@yingyeothon/slack-logger/lib/asYlogger";
import env from "./support/env";
import lockRelease from "@yingyeothon/actor-system-redis-support/lib/lock/release";
import responses from "./support/responses";
import useRedis from "./support/useRedis";

const logger = getLogger("handle:debug", __filename);

export const handle: APIGatewayProxyHandler = async (event) => {
  if (!env.isOffline) {
    return responses.NotFound;
  }

  try {
    const startEvent = JSON.parse(event.body!) as GameActorStartEvent;
    logger.debug({ startEvent }, `Start for debugging`);

    await useRedis(async (redisConnection) =>
      lockRelease({
        connection: redisConnection,
        keyPrefix: actorSubsysKeys.lockKeyPrefix,
        logger: asYlogger(logger),
      }).release(startEvent.gameId)
    );
    logger.debug({ gameId: startEvent.gameId }, `Release actor's lock`);

    // Start a new Lambda to process game messages.
    const promise = new Lambda({
      endpoint: `http://localhost:3002`,
    })
      .invoke({
        FunctionName: env.gameActorLambdaName,
        InvocationType: "Event",
        Qualifier: "$LATEST",
        Payload: JSON.stringify(startEvent),
      })
      .promise();

    if (event.queryStringParameters?.waitSetup) {
      await promise;
    }
    return responses.OK;
  } finally {
    await flushSlack();
  }
};
