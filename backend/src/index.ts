import { env } from "./config/env";
import { connectDb } from "./config/db";
import { createApp } from "./app";

async function bootstrap() {
  await connectDb();
  const app = createApp();
  app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`Backend Omong listening on ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

