import { exists } from "@std/fs";

import type { CliArgs } from "./index.ts";
import { getInput } from "../util/api.ts";
import { copyFiles, getDayDir, getDayPath } from "../util/files.ts";
import { runDay } from "../run.ts";

export async function day(args: CliArgs): Promise<number> {
  const day = Number(args._[1]);
  if (!Number.isInteger(day) || day < 1 || day > 25) {
    console.error("Invalid day - expected a number between 1 and 25.");
    return 1;
  }

  const entryPath = getDayPath(day, "main.ts");
  const inputPath = getDayPath(day, "input.txt");

  // TODO: do this the right way?
  if (!(await exists(entryPath))) {
    console.log(`Initializing day ${day}`);
    await copyFiles("template", getDayDir(day));
  }

  if (!(await exists(inputPath))) {
    const input = await getInput();
    await Deno.writeTextFile(inputPath, input);
    console.log(`Fetched input for day ${day}`);
  }

  return runDay(day);
}
