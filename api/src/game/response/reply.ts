import { ApiGatewayManagementApi } from "aws-sdk";
import FakeConnectionId from "./models/FakeConnectionId";
import env from "../support/env";
import { getLogger } from "@yingyeothon/slack-logger";

const apimgmt = new ApiGatewayManagementApi({
  endpoint: env.isOffline ? `http://localhost:3001` : env.webSocketEndpoint,
});

const logger = getLogger("reply", __filename);

export default async function reply<T extends { type: string }>(
  connectionId: string,
  response: T
): Promise<boolean> {
  if (connectionId === FakeConnectionId || !connectionId) {
    return Promise.resolve(true);
  }
  try {
    await apimgmt
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(response),
      })
      .promise();
    logger.debug({ connectionId, response }, `Reply`);
    return true;
  } catch (error) {
    (/GoneException/.test(error.name) ? logger.debug : logger.error)(
      { connectionId, response, error },
      `Cannot reply to`
    );
    return false;
  }
}
