import fp from "fastify-plugin";
import cors from "@fastify/cors";

export const corsPlugin = fp(async (app) => {
  await app.register(cors, {
    origin: process.env.WEB_URL ?? "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });
});
