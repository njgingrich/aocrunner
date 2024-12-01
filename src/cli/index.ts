import * as log from "@std/log";

import { initLogger } from "../logger.ts";
import { getArgs } from "../util/cli.ts";
import { day } from "./day.ts";
import { help } from "./help.ts";
import { init } from "./init.ts";
import { submit } from "./submit.ts";

initLogger();

async function main(): Promise<void> {
  const args = getArgs();
  const command = args._[0];
  log.debug("Initialized with arguments", args);

  if (args.help) {
    help();
    Deno.exit(0);
  }

  if (command === "init") {
    Deno.exit(await init());
  }

  if (command === "day") {
    Deno.exit(await day(args));
  }

  if (command === "submit") {
    Deno.exit(await submit(args));
  }

  Deno.exit(0);
}

export { main as cli };
