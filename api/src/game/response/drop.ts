import FakeConnectionId from "./models/FakeConnectionId";
import env from "../support/env";
import { getLogger } from "@yingyeothon/slack-logger";
import { newApiGatewayManagementApi } from "@yingyeothon/aws-apigateway-management-api";

const logger = getLogger("dropConnection", __filename);

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
    (/GoneException/.test(error.name) ? logger.debug : logger.error)(
      { connectionId, error },
      `Cannot disconnect`
    );
    return false;
  }
}
