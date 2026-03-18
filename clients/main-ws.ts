
import {startSolcatcherWebsocket} from '@putkoff/abstract-rabbit';
import {getLogString} from '@putkoff/abstract-logger';

process.on("uncaughtException", err => {
  getLogString({
    logType: "fatal",
    message: "Uncaught exception",
    details: err.stack ?? err.message,
  });
});

process.on("unhandledRejection", err => {
  getLogString({
    logType: "fatal",
    message: "Unhandled promise rejection",
    details: String(err),
  });
});


(async () => {
  await startSolcatcherWebsocket();
})();
