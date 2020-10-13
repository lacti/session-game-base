import env from "./support/env";
import redisConnect from "@yingyeothon/naive-redis/lib/connection";

const redisConnection = redisConnect({
  host: env.redisHost,
  password: env.redisPassword,
});

export default redisConnection;
