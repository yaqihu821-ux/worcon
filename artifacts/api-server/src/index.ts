// @ts-nocheck
import app from "./app.js";
import { logger } from "./lib/logger.js";

// 加上 "3000" 作为默认端口，防止 Vercel 没传 PORT 变量时直接崩溃
const rawPort = process.env["PORT"] || "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
