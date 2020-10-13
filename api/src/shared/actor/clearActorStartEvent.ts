import actorSubsysKeys from "./actorSubsysKeys";

export default async function clearActorStartEvent({
  gameId,
  del,
}: {
  gameId: string;
  del: (key: string) => Promise<any>;
}) {
  return del(actorSubsysKeys.keyPrefixOfEvent + gameId);
}
