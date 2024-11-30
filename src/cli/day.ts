import { exists } from "@std/fs";

import type { CliArgs } from "./index.ts";
import { copyFiles, getDayDir, getDayPath } from "../util/files.ts";
import { runDay } from "../actions/run.ts";
import { getConfig } from "../config.ts";
import { getClient } from "../api/client.ts";
import { getSessionToken } from "../util/session.ts";
import { ApiResult } from "../api/types.ts";

export async function day(args: CliArgs): Promise<number> {
  const day = Number(args._[1]);
  if (!Number.isInteger(day) || day < 1 || day > 25) {
    console.error("Invalid day - expected a number between 1 and 25.");
    return 1;
  }

  const config = await getConfig();
  const client = getClient({ config, sessionToken: getSessionToken() });

  const entryPath = getDayPath(day, "main.ts");
  const inputPath = getDayPath(day, "input.txt");

  // TODO: do this the right way?
  if (!(await exists(entryPath))) {
    console.log(`Initializing day ${day}`);
    await copyFiles("template", getDayDir(day));
  }

  if (!(await exists(inputPath))) {
    const response = await client.getInput(day);
    if (response.type !== ApiResult.SUCCESS) {
      console.error("Failed to fetch input");
      return 1;
    }

    await Deno.writeTextFile(inputPath, response.input);
    console.log(`Fetched input for day ${day}`);
  }

  return runDay(day);
}
