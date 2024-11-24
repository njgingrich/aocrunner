import { exists } from "@std/fs";
import { join } from "@std/path";

import type { CliArgs } from "./index.ts";
import { getInput } from "../util/api.ts";
import { copyFiles } from "../util/files.ts";

export async function day(args: CliArgs): Promise<number> {
  const day = Number(args._[1]);
  if (!Number.isInteger(day) || day < 1 || day > 25) {
    console.error("Invalid day - expected a number between 1 and 25.");
    return 1;
  }

  const dir = `day${day.toString().padStart(2, "0")}`;
  // TODO: do this the right way?
  if (!(await exists(join(dir, "main.ts")))) {
    console.log(`Initializing day ${day}`);
    await copyFiles("template", dir);
  }

  if (!(await exists(join(dir, "input.txt")))) {
    const input = await getInput();
    await Deno.writeTextFile(join(dir, "input.txt"), input);
    console.log(`Fetched input for day ${day}`);
  }

  console.log(`Running \`deno run ${join(dir, "main.ts")}\` in ${Deno.cwd()}`);
  const process = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-read",
      "--allow-write",
      join(dir, "main.ts"),
    ],
    cwd: join(Deno.cwd(), dir),
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
