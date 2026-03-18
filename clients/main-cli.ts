
import { bootSolcatcher } from "@Pipeline/cli.js";
import {getLogString,setLogs} from '@imports';
setLogs(1)

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

  process.exit(0);
});
(async () => {
  await bootSolcatcher();
})();


