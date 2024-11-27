import {
  assertSpyCall,
  assertSpyCallAsync,
  assertSpyCalls,
  returnsNext,
  spy,
  stub,
} from "@std/testing/mock";
import { Config } from "../config.ts";
import { AocConfig } from "../types.ts";
import { submitDay } from "./submit.ts";
import { assertEquals } from "@std/assert/equals";

Deno.test("It should say already solved if part 2 is solved", async () => {
  const solvedConfig = {
    year: "2024",
    days: {
      "1": {
        part1: {
          solved: true,
          result: 123,
          tries: 1,
          runtime: 112,
        },
        part2: {
          solved: true,
          result: 456,
          tries: 1,
          runtime: 112,
        },
      },
    },
  } as const satisfies AocConfig;

  const config = new Config(solvedConfig);
  using consoleSpy = spy(console, "log");

  const result = await submitDay({
    day: 1,
    config,
    submitFn: spy(),
    runFn: spy(),
  });
  assertEquals(result, 0);
  assertSpyCall(consoleSpy, 0, { args: ["Part 2 already solved!"] });
});

Deno.test("It should submit part 2 if result but not solved", async () => {
  const dayConfig = {
    year: "2024",
    days: {
      "1": {
        part1: {
          solved: true,
          result: 123,
          tries: 1,
          runtime: 112,
        },
        part2: {
          solved: false,
          result: 456,
          tries: 1,
          runtime: 112,
        },
      },
    },
  } as const satisfies AocConfig;

  const config = new Config(dayConfig);
  const submitSpy = spy((day: number, part: 1 | 2, solution: any) => Promise.resolve());

  const result = await submitDay({
    day: 1,
    config,
    submitFn: submitSpy,
    runFn: spy(),
  });
  assertEquals(result, 0);
  assertSpyCallAsync(submitSpy, 0, { args: [1, 2, 456] });
});

Deno.test("It should submit part 1 if part 2 has no result and part 1 is unsolved", async () => {
  const dayConfig = {
    year: "2024",
    days: {
      "1": {
        part1: {
          solved: false,
          result: 123,
          tries: 1,
          runtime: 112,
        },
        part2: {
          solved: false,
          result: undefined,
          tries: 1,
          runtime: 112,
        },
      },
    },
  } as const satisfies AocConfig;

  const config = new Config(dayConfig);
  const submitSpy = spy((day: number, part: 1 | 2, solution: any) => Promise.resolve());

  const result = await submitDay({
    day: 1,
    config,
    submitFn: submitSpy,
    runFn: spy(),
  });
  assertEquals(result, 0);
  assertSpyCallAsync(submitSpy, 0, { args: [1, 1, 123] });
});

Deno.test("It should run the day and submit part 1 if no part 1 result", async () => {
  const dayConfig = {
    year: "2024",
    days: {
      "1": {
        part1: {
          solved: false,
          result: undefined,
          tries: 1,
          runtime: 112,
        },
        part2: {
          solved: false,
          result: undefined,
          tries: 1,
          runtime: 112,
        },
      },
    },
  } as const satisfies AocConfig;

  const config = new Config(dayConfig);
  using configStub = stub(
    config,
    "getDay",
    returnsNext([
      dayConfig.days[1],
      // On second call to getDay(1) pretend we got a result back
      {
        part1: {
          solved: false,
          result: "abc",
          tries: 0,
        },
        part2: {
          solved: false,
          result: undefined,
          tries: 0,
        },
      },
    ]),
  );
  const submitSpy = spy((day: number, part: 1 | 2, solution: any) => Promise.resolve());
  const runDaySpy = spy(async (day: number) => 0);

  const result = await submitDay({
    day: 1,
    config,
    submitFn: submitSpy,
    runFn: runDaySpy,
  });
  assertEquals(result, 0);
  assertSpyCallAsync(runDaySpy, 0, { args: [1] });
  assertSpyCallAsync(submitSpy, 0, { args: [1, 1, "abc"] });
});

Deno.test("It should error if part 2 has no result and part 1 is solved", async () => {
  const dayConfig = {
    year: "2024",
    days: {
      "1": {
        part1: {
          solved: true,
          result: "abc",
          tries: 1,
          runtime: 112,
        },
        part2: {
          solved: false,
          result: undefined,
          tries: 1,
          runtime: 112,
        },
      },
    },
  } as const satisfies AocConfig;

  const config = new Config(dayConfig);
  const submitSpy = spy((day: number, part: 1 | 2, solution: any) => Promise.resolve());
  const runDaySpy = spy(async (day: number) => 0);
  using consoleSpy = spy(console, "log");

  const result = await submitDay({
    day: 1,
    config,
    submitFn: submitSpy,
    runFn: runDaySpy,
  });
  assertEquals(result, 1);
  assertSpyCall(consoleSpy, 0, { args: ["Part 2 has no answer but part 1 is solved!"] });
});

Deno.test("It should error if no results found even after running", async () => {
  const dayConfig = {
    year: "2024",
    days: {
      "1": {
        part1: {
          solved: false,
          result: undefined,
          tries: 1,
          runtime: 112,
        },
        part2: {
          solved: false,
          result: undefined,
          tries: 1,
          runtime: 112,
        },
      },
    },
  } as const satisfies AocConfig;

  const config = new Config(dayConfig);
  using configStub = stub(
    config,
    "getDay",
    returnsNext([
      dayConfig.days[1],
      // On second call to getDay(1) pretend we still got no results back
      {
        part1: {
          solved: false,
          result: undefined,
          tries: 0,
        },
        part2: {
          solved: false,
          result: undefined,
          tries: 0,
        },
      },
    ]),
  );
  const submitSpy = spy((day: number, part: 1 | 2, solution: any) => Promise.resolve());
  const runDaySpy = spy(async (day: number) => 0);
  using consoleSpy = spy(console, "error");

  const result = await submitDay({
    day: 1,
    config,
    submitFn: submitSpy,
    runFn: runDaySpy,
  });
  assertEquals(result, 1);
  assertSpyCall(consoleSpy, 0, { args: ["No results found for day 1."] });
});
