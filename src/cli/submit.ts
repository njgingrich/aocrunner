import { getConfig } from "../config.ts";
import { CliArgs } from "./index.ts";
import { runDay } from "../actions/run.ts";
import { submitDay } from "../actions/submit.ts";
import { getClient } from "../api/client.ts";
import { getSessionToken } from "../util/session.ts";

export async function submit(args: CliArgs): Promise<number> {
  const day = Number(args._[1]);
  if (!Number.isInteger(day) || day < 1 || day > 25) {
    console.error("Invalid day - expected a number between 1 and 25.");
    return 1;
  }

  const config = await getConfig();
  const client = getClient({
    config,
    sessionToken: getSessionToken(),
  });

  return submitDay({ day, config, submitFn: client.submit, runFn: runDay });
}
