import GameActorStartEvent from "./GameActorStartEvent";
import actorSubsysKeys from "./actorSubsysKeys";

export default async function loadActorStartEvent({
  gameId,
  get,
}: {
  gameId: string;
  get: (key: string) => Promise<string | null>;
}): Promise<GameActorStartEvent | null> {
  const value = await get(actorSubsysKeys.keyPrefixOfEvent + gameId);
  if (value === null) {
    return null;
  }
  try {
    const event = JSON.parse(value) as GameActorStartEvent;
    if (!event.gameId) {
      return null;
    }
    return event;
  } catch (error) {
    // Ignore
  }
  return null;
}
