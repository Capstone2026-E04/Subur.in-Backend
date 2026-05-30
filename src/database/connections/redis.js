"use strict";

const Redis = require("ioredis");

let redisClient = null;

function getRedisClient() {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  } else {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }

  redisClient.on("connect", () => {
    console.log("[Redis] ✅ Terhubung ke Redis.");
  });

  redisClient.on("error", (err) => {
    console.error("[Redis] ❌ Error koneksi Redis:", err.message);
  });

  redisClient.on("close", () => {
    console.warn("[Redis] 🔌 Koneksi Redis ditutup.");
  });

  return redisClient;
}

module.exports = { getRedisClient };
