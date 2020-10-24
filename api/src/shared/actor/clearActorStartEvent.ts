import actorSubsysKeys from "./actorSubsysKeys";

export default async function clearActorStartEvent({
  gameId,
  del,
}: {
  gameId: string;
  del: (key: string) => Promise<unknown>;
}): Promise<unknown> {
  return del(actorSubsysKeys.keyPrefixOfEvent + gameId);
}
