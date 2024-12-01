import { parseArgs } from "@std/cli";

export function getArgs(args: string[] = Deno.args) {
  return parseArgs(args, {
    boolean: ["help", "version", "debug"],
    alias: {
      help: ["h"],
      version: ["v"],
      debug: ["d"]
    },
  });
}

export type CliArgs = ReturnType<typeof getArgs>;
