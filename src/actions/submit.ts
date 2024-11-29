import type { RunDayFn } from "../run.ts";
import { Config } from "../config.ts";
import { ApiClient } from "../api/client.ts";

export async function submitDay({
  day,
  config,
  submitFn,
  runFn,
}: {
  day: number;
  config: Config;
  submitFn: ApiClient["submit"];
  runFn: RunDayFn;
}): Promise<number> {
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
    await submitFn(day, 2, dayConfig.part2.result);
    return 0;
  }

  if (!dayConfig.part2.result && dayConfig.part1.solved) {
    console.log("Part 2 has no answer but part 1 is solved!");
    return 1;
  }

  // If there is no part 2 result, submit part 1 if unsolved.
  if (!dayConfig.part1.solved && dayConfig.part1.result) {
    console.log("Submitting part 1 solution.");
    // TODO: submit it
    await submitFn(day, 1, dayConfig.part1.result);
    return 0;
  }

  // If there is no part 1 result, run the day.
  if (!dayConfig.part1.result) {
    console.log(`No results found, running day ${day}.`);
    await runFn(day);
    // Try again!
    dayConfig = config.getDay(day);
  }

  // Now if it doesn't exist there's a problem
  if (!dayConfig.part1.result) {
    console.error(`No results found for day ${day}.`);
    return 1;
  }

  // Otherwise back to submitting part 1
  console.log("Submitting part 1 solution.");
  // TODO: submit it
  const result = await submitFn(day, 1, dayConfig.part1.result);

  return 0;
}
