import type { RunDayFn } from "./run.ts";
import type { Config } from "../config.ts";
import type { ApiClient } from "../api/client.ts";
import { ApiResult, type SubmitResponse } from "../api/types.ts";

function handleResponse(response: SubmitResponse): number {
  if (response.type === ApiResult.SUCCESS) {
    console.log("You got the right answer!");
    return 0;
  } else if (response.type === ApiResult.FAILURE) {
    console.log("That's not the right answer.");
    return 1;
  } else if (response.type === ApiResult.RATE_LIMIT) {
    console.log(
      `You gave an answer too recently. Please wait ${response.delayMs}ms.`,
    );
    return 1;
  } else if (response.type === ApiResult.TOKEN_ERROR) {
    console.error("Invalid session token. Make sure you have it set in your .env file!");
    return 1;
  } else if (response.type === ApiResult.ERROR) {
    console.error("An error occurred:", response.error);
    return 1;
  } else {
    console.log("Unknown error:", response);
    return 1;
  }
}

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
    const res = await submitFn(day, 2, dayConfig.part2.result);
    return handleResponse(res);
  }

  if (!dayConfig.part2.result && dayConfig.part1.solved) {
    console.log("Part 2 has no answer but part 1 is solved!");
    return 1;
  }

  // If there is no part 2 result, submit part 1 if unsolved.
  if (!dayConfig.part1.solved && dayConfig.part1.result) {
    console.log("Submitting part 1 solution.");
    const res = await submitFn(day, 1, dayConfig.part1.result);
    return handleResponse(res);
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
  const res = await submitFn(day, 1, dayConfig.part1.result);
  return handleResponse(res);
}
