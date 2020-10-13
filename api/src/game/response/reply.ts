import { ApiGatewayManagementApi } from "aws-sdk";
import FakeConnectionId from "./models/FakeConnectionId";
import env from "../support/env";
import logger from "../logger";

const apimgmt = new ApiGatewayManagementApi({
  endpoint: env.isOffline ? `http://localhost:3001` : env.webSocketEndpoint,
});

export default async function reply<T extends { type: string }>(
  connectionId: string,
  response: T
): Promise<boolean> {
  if (connectionId === FakeConnectionId) {
    return Promise.resolve(true);
  }
  try {
    await apimgmt
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(response),
      })
      .promise();
    logger.debug(`Reply`, connectionId, response);
    return true;
  } catch (error) {
    logger.error(`Cannot reply to`, connectionId, response, error);
    return false;
  }
}
