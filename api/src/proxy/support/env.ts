const env = {
  redisHost: process.env.REDIS_HOST!,
  redisPassword: process.env.REDIS_PASSWORD,
  gameActorLambdaName: process.env.GAME_ACTOR_LAMBDA_NAME!,
  isOffline: !!process.env.IS_OFFLINE,
  redisKeyPrefixOfConnectionIdAndGameId: `${process.env.GAME_NAME}/gameId/`,
};

export default env;
