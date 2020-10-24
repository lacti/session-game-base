import GameActorStartEvent from "./GameActorStartEvent";
import actorSubsysKeys from "./actorSubsysKeys";

export default async function saveActorStartEvent({
  event,
  set,
}: {
  event: GameActorStartEvent;
  set: (key: string, value: string) => Promise<unknown>;
}): Promise<boolean> {
  if (!event.gameId) {
    return false;
  }
  await set(
    actorSubsysKeys.keyPrefixOfEvent + event.gameId,
    JSON.stringify(event)
  );
  return true;
}
