import { getConfig } from "../config.ts";
import { CliArgs } from "./index.ts";
import { runDay } from "../run.ts";

export async function submit(args: CliArgs): Promise<number> {
  const day = Number(args._[1]);
  if (!Number.isInteger(day) || day < 1 || day > 25) {
    console.error("Invalid day - expected a number between 1 and 25.");
    return 1;
  }

  // Get solution from previous runs. If no result, run the solution
  let config = await getConfig();

  // We have to order the checks to submit things correctly.
  // If part 2 is solved, return that.
  if (config.days[day].part2.solved) {
    console.log("Part 2 already solved!");
    return 0;
  }

  // If there is a part 2 result, submit part 2.
  if (config.days[day].part2.result) {
    console.log("Submitting part 2 solution.");
    // TODO: submit it
    return 0;
  }

  // If there is no part 2 result, submit part 1 if unsolved.
  if (!config.days[day].part1.solved && config.days[day].part1.result) {
    console.log("Submitting part 1 solution.");
    // TODO: submit it
    return 0;
  }

  // If there is no part 1 result, run the day.
  if (!config.days[day].part1.result) {
    console.log(`No results found, running day ${day}.`);
    await runDay(day);
    // Try again!
    config = await getConfig();
  }

  // Now if it doesn't exist there's a problem
  if (!config.days[day].part1.result) {
    console.error(`No results found for day ${day}.`);
    return 1;
  }

  // Otherwise back to submitting part 1
  console.log("Submitting part 1 solution.");
  // TODO: submit it

  return 0;
}
