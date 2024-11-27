import { getConfig } from "../config.ts";
import { CliArgs } from "./index.ts";
import { runDay } from "../run.ts";
import { submitSolution } from "../util/api.ts";
import { submitDay } from "../actions/submit.ts";

export async function submit(args: CliArgs): Promise<number> {
  const day = Number(args._[1]);
  if (!Number.isInteger(day) || day < 1 || day > 25) {
    console.error("Invalid day - expected a number between 1 and 25.");
    return 1;
  }

  const config = await getConfig();

  return submitDay({ day, config, submitFn: submitSolution, runFn: runDay });
}
