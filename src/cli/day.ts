import { exists } from "@std/fs";

import type { CliArgs } from "../util/cli.ts";
import { copyFiles, getDayDir, getDayPath } from "../util/files.ts";
import { runDay } from "../actions/run.ts";
import { getConfig } from "../config.ts";
import { getClient } from "../api/client.ts";
import { getSessionToken } from "../util/session.ts";
import { ApiResult, type InputResponse } from "../api/types.ts";

function handleResponse(response: InputResponse): string | void {
  switch (response.type) {
    case ApiResult.SUCCESS:
      console.log("Fetched input successfully.");
      return response.input;
    case ApiResult.NOT_FOUND:
      console.error("Failed to fetch input - day not found.");
      return;
    case ApiResult.TOKEN_ERROR:
      console.error("Missing a session token! Make sure to update your .env file.");
      return;
    case ApiResult.ERROR:
      console.error("Failed to fetch input:", response.error);
      return;
    case ApiResult.UNKNOWN:
      console.error("Unknown error:", response);
      return;
  }
}

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
    const input = handleResponse(response);
    if (!input) {
      return 1;
    }

    await Deno.writeTextFile(inputPath, input);
    console.log(`Fetched input for day ${day}`);
  }

  return runDay(day);
}
