import * as log from "@std/log";
import { getArgs } from "./util/cli.ts";

export function initLogger() {
  const args = getArgs();
  const level = args.debug ? "DEBUG" : "INFO";

  log.setup({
    handlers: {
      console: new log.ConsoleHandler(level, {
        useColors: true,
        formatter: (logRecord: log.LogRecord) => {
          let msg = `[${logRecord.levelName} - ${(new Date()).toISOString()}]: ${logRecord.msg}`;

          logRecord.args.forEach((arg: unknown, index: number) => {
            msg += `, ${index}=${JSON.stringify(arg)}`;
          });

          return msg;
        },
      }),
    },
    loggers: {
      default: {
        level,
        handlers: ["console"],
      },
    },
  });
}
