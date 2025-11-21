import Redis from "ioredis"

const redisClient = new Redis({
  host: "127.0.0.1",
  port: 6379,
})

redisClient.on("ready", () => {
  console.log(`[redisClient]: Connection to the redis-server established`)
})

redisClient.on("end", () => {
  console.log(`[redisClient]: Connection to the redis-server closed`)
})

redisClient.on("error", (error) => {
  console.error(`[redisClient]: Connection to the redis-server failed or lost, ${error}`)
})

export default redisClient
