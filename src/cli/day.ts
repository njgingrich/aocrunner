import type { CliArgs } from "./index.ts";

export async function day(args: CliArgs): Promise<number> {
  const day = Number(args._[1]);
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    console.error("Invalid day - expected a number between 1 and 31.");
    return 1;
  }
  console.log(`Running day ${day}`);
  return 0;
}
