import FakeConnectionId from "./models/FakeConnectionId";
import env from "../support/env";
import logger from "../logger";
import { newApiGatewayManagementApi } from "@yingyeothon/aws-apigateway-management-api";

export default async function dropConnection(
  connectionId: string
): Promise<boolean> {
  if (connectionId === FakeConnectionId) {
    return true;
  }
  try {
    await newApiGatewayManagementApi({
      endpoint: env.isOffline ? `http://localhost:3001` : env.webSocketEndpoint,
    })
      .deleteConnection({
        ConnectionId: connectionId,
      })
      .promise();
    return true;
  } catch (error) {
    logger.error(`Cannot disconnect`, connectionId, error);
    return false;
  }
}
