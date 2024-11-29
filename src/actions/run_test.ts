import {
  assertSpyCall,
  assertSpyCallAsync,
  assertSpyCalls,
  returnsNext,
  spy,
  stub,
} from "@std/testing/mock";
import { TestConfig } from "../config.ts";
import { AocConfig } from "../types.ts";
import { submitDay } from "./submit.ts";
import { assertEquals } from "@std/assert/equals";
import { SubmitResponse } from "../api/types.ts";
import { ApiClient } from "../api/client.ts";
import { run, RunParams } from "./run.ts";
import { _ } from "./run.ts";

Deno.test("It should run part 1 if solve is true", async () => {
  const params = {
    part1: {
      solve: true,
      solver: (input: string) => `part1`,
      tests: [
        { input: "input", expected: "part1" },
      ],
    },
    part2: {
      solve: false,
      solver: (input: string) => `part2`,
    },
    day: 1,
    input: "input",
  } satisfies RunParams;

  using runTestsSpy = spy(_, "runTests");
  using runSolverSpy = spy(_, "runSolver");

  await run(params, new TestConfig());
  assertSpyCall(runTestsSpy, 0, {
    args: [params.part1],
    returned: ["part1"],
  });
  assertSpyCall(runSolverSpy, 0, {
    args: [params.part1, params.input],
    returned: { result: "part1", runtime: 0 },
  });
});

Deno.test("It should run part 2 if solve is true", async () => {
  const params = {
    part1: {
      solve: true,
      solver: (input: string) => `part1`,
      tests: [
        { input: "input", expected: "part1" },
      ],
    },
    part2: {
      solve: true,
      solver: (input: string) => `part2`,
    },
    day: 1,
    input: "input",
  } satisfies RunParams;

  using runTestsSpy = spy(_, "runTests");
  using runSolverSpy = spy(_, "runSolver");

  await run(params, new TestConfig());
  assertSpyCall(runTestsSpy, 0, {
    args: [params.part1],
    returned: ["part1"],
  });
  assertSpyCalls(runTestsSpy, 1); // part 2 has no tests
  assertSpyCall(runSolverSpy, 1, {
    args: [params.part2, params.input],
    returned: { result: "part2", runtime: 0 },
  });
});

Deno.test("It should update config for returning result", async () => {
  const params = {
    part1: {
      solve: true,
      solver: (input: string) => `part1`,
      tests: [
        { input: "input", expected: "part1" },
      ],
    },
    part2: {
      solve: false,
      solver: (input: string) => undefined,
    },
    day: 1,
    input: "input",
  } satisfies RunParams;

  const config = new TestConfig({
    year: "2024",
    days: {
      "1": {
        part1: { solved: false, result: "test", tries: 1 },
        part2: { solved: false, tries: 0 },
      },
    },
  });
  assertEquals(config.getDay(1).part1.tries, 1);

  using runTestsSpy = spy(_, "runTests");

  await run(params, config);
  assertSpyCall(runTestsSpy, 0, {
    args: [params.part1],
    returned: ["part1"],
  });
  assertSpyCalls(runTestsSpy, 1); // part 2 has no tests
  assertEquals(config.getDay(1), {
    part1: {
      solved: false,
      result: "part1", // not "test"
      tries: 2, // +1 from existing config
      runtime: 0,
    },
    part2: {
      solved: false,
      tries: 0, // not incremented because we did not call part 2
    },
  });
});

Deno.test("It should update config (tries) if no result is returned from solver", async () => {
  const params = {
    part1: {
      solve: true,
      solver: (input: string) => `part1`,
      tests: [
        { input: "input", expected: "part1" },
      ],
    },
    part2: {
      solve: true,
      solver: (input: string) => undefined,
    },
    day: 1,
    input: "input",
  } satisfies RunParams;

  const config = new TestConfig({
    year: "2024",
    days: {
      "1": {
        part1: { solved: false, result: "test", tries: 1 },
        part2: { solved: false, tries: 0 },
      },
    },
  });
  assertEquals(config.getDay(1).part1.tries, 1);

  using runTestsSpy = spy(_, "runTests");
  using runSolverSpy = spy(_, "runSolver");

  await run(params, config);
  assertSpyCall(runTestsSpy, 0, {
    args: [params.part1],
    returned: ["part1"],
  });
  assertSpyCalls(runTestsSpy, 1); // part 2 has no tests
  assertSpyCalls(runSolverSpy, 2);
  assertEquals(config.getDay(1).part1.result, "part1");
  assertEquals(config.getDay(1).part2.result, undefined);
  assertEquals(config.getDay(1).part2.tries, 1);
});
