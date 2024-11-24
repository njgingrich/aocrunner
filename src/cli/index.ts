import { parseArgs } from "@std/cli";

import { day } from "./day.ts";
import { help } from "./help.ts";
import { init } from "./init.ts";

function getArgs(args: string[] = Deno.args) {
  return parseArgs(args, {
    boolean: ["help", "version"],
    alias: {
      help: ["h"],
      version: ["v"],
    },
  });
}

export type CliArgs = ReturnType<typeof getArgs>;

async function main(): Promise<void> {
  const args = getArgs();
  const command = args._[0];

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

  Deno.exit(0);
}

if (import.meta.main) {
  main();
}

export { main as cli };
