
import {initSolcatcherServer} from "@ts-server";
process.on("uncaughtException", err => {
  console.log({
    logType: "fatal",
    message: "Uncaught exception",
    details: err.stack ?? err.message,
  });

  process.exit(1);
});

process.on("unhandledRejection", err => {
  console.log({
    logType: "fatal",
    message: "Unhandled promise rejection",
    details: String(err),
  });

  process.exit(1);
});


(async () => {
  
  await initSolcatcherServer();
})().catch(err => {
  console.error("Limiter server failed:", err);
  process.exit(1);
});