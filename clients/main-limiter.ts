import { initLimiterServer } from "@limiter-server";
import {getLogString} from '@imports';

process.on("uncaughtException", err => {
  getLogString({
    logType: "fatal",
    message: "Uncaught exception",
    details: err.stack ?? err.message,
  });

  process.exit(1);
});

process.on("unhandledRejection", err => {
  getLogString({
    logType: "fatal",
    message: "Unhandled promise rejection",
    details: String(err),
  });

  process.exit(1);
});

(async () => {
  await initLimiterServer();
})().catch(err => {
  console.error("Limiter server failed:", err);
  process.exit(1);
});