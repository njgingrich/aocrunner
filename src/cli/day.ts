import { exists } from "@std/fs";
import { join } from "@std/path";

import type { CliArgs } from "./index.ts";
import { getInput } from "../util/api.ts";
import { copyFiles, getDayDir, getDayPath } from "../util/files.ts";

export async function day(args: CliArgs): Promise<number> {
  const day = Number(args._[1]);
  if (!Number.isInteger(day) || day < 1 || day > 25) {
    console.error("Invalid day - expected a number between 1 and 25.");
    return 1;
  }

  const dayDir = getDayDir(day);
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

  console.log(`Running Day ${day}`);
  const process = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-read",
      "--allow-write",
      "main.ts",
    ],
    cwd: dayDir,
  });

  const out = await process.output();
  const stdout = new TextDecoder().decode(out.stdout);
  console.log(stdout);
  const stderr = new TextDecoder().decode(out.stderr);
  console.error(stderr);

  if (!out.success) {
    return 1;
  }

  return 0;
}
