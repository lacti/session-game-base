const gameName = process.env.GAME_NAME!;

const actorSubsysKeys = {
  awaiterKeyPrefix: `:${gameName}:awaiter/`,
  lockKeyPrefix: `:${gameName}:lock/`,
  queueKeyPrefix: `:${gameName}:queue/`,
  keyPrefixOfEvent: `${gameName}/actor-event/`,
};

export default actorSubsysKeys;
