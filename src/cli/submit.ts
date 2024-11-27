import { Config, getConfig } from "../config.ts";
import { CliArgs } from "./index.ts";
import { runDay } from "../run.ts";

export async function submit(args: CliArgs, config: Config): Promise<number> {
  const day = Number(args._[1]);
  if (!Number.isInteger(day) || day < 1 || day > 25) {
    console.error("Invalid day - expected a number between 1 and 25.");
    return 1;
  }

  // Get solution from previous runs. If no result, run the solution;
  let dayConfig = config.getDay(day);

  // We have to order the checks to submit things correctly.
  // If part 2 is solved, return that.
  if (dayConfig.part2.solved) {
    console.log("Part 2 already solved!");
    return 0;
  }

  // If there is a part 2 result, submit part 2.
  if (dayConfig.part2.result) {
    console.log("Submitting part 2 solution.");
    // TODO: submit it
    return 0;
  }

  // If there is no part 2 result, submit part 1 if unsolved.
  if (!dayConfig.part1.solved && dayConfig.part1.result) {
    console.log("Submitting part 1 solution.");
    // TODO: submit it
    return 0;
  }

  // If there is no part 1 result, run the day.
  if (!dayConfig.part1.result) {
    console.log(`No results found, running day ${day}.`);
    await runDay(day);
    // Try again!
    dayConfig = (await getConfig()).getDay(day);
  }

  // Now if it doesn't exist there's a problem
  if (!dayConfig.part1.result) {
    console.error(`No results found for day ${day}.`);
    return 1;
  }

  // Otherwise back to submitting part 1
  console.log("Submitting part 1 solution.");
  // TODO: submit it

  return 0;
}
