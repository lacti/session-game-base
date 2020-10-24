import RespondResult from "./models/RespondResult";
import { getLogger } from "@yingyeothon/slack-logger";
import reply from "./reply";

const logger = getLogger("broadcast", __filename);

export default async function broadcast<T extends { type: string }>(
  connectionIds: string[],
  response: T
): Promise<RespondResult> {
  const result = await Promise.all(
    connectionIds.map((connectionId) =>
      reply(connectionId, response).then(
        (success) =>
          ({
            [connectionId]: success,
          } as RespondResult)
      )
    )
  );
  const map = result.reduce(
    (acc, cur) => Object.assign(acc, cur),
    {} as RespondResult
  );
  logger.debug({ response, map }, `Broadcast`);
  return map;
}
