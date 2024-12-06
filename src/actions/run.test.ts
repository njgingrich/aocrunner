import { assertSpyCall, assertSpyCalls, spy } from "@std/testing/mock";
import { TestConfig } from "../config.ts";
import { assertEquals } from "@std/assert/equals";
import { run, type RunParams } from "./run.ts";
import { _ } from "./run.ts";

Deno.test("It should run part 1 if solve is true", async () => {
  const params = {
    part1: {
      solve: true,
      solver: () => `part1`,
      tests: [
        { input: "input", expected: "part1" },
      ],
    },
    part2: {
      solve: false,
      solver: () => `part2`,
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
      solver: () => `part1`,
      tests: [
        { input: "input", expected: "part1" },
      ],
    },
    part2: {
      solve: true,
      solver: () => `part2`,
    },
    day: 1,
    input: "input",
  } satisfies RunParams;

  using runTestsSpy = spy(_, "runTests");
  using runSolverSpy = spy(_, "runSolver");

  const config = new TestConfig({
    year: "2024",
    days: { "1": { part1: { solved: true, result: "part1" }, part2: { solved: false } } },
  });

  await run(params, config);
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
      solver: () => `part1`,
      tests: [
        { input: "input", expected: "part1" },
      ],
    },
    part2: {
      solve: false,
      solver: () => undefined,
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
      solver: () => `part1`,
      tests: [
        { input: "input", expected: "part1" },
      ],
    },
    part2: {
      solve: true,
      solver: () => undefined,
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

Deno.test("It should not run part 2 if part 1 is not solved", async () => {
  const params = {
    part1: {
      solve: true,
      solver: () => `part1`,
      tests: [
        { input: "input", expected: "part1" },
      ],
    },
    part2: {
      solve: false,
      tests: [
        { input: "input", expected: "part1" },
      ],
      solver: () => `part2`,
    },
    day: 1,
    input: "input",
  } satisfies RunParams;

  using runTestsSpy = spy(_, "runTests");
  using runSolverSpy = spy(_, "runSolver");

  const config = new TestConfig({
    year: "2024",
    days: {
      "1": {
        part1: { solved: false, result: "test", tries: 1 },
        part2: { solved: false, tries: 0 },
      },
    },
  });
  await run(params, config);
  assertSpyCall(runTestsSpy, 0, {
    args: [params.part1],
    returned: ["part1"],
  });
  assertSpyCalls(runTestsSpy, 1); // part 2 was not run
  assertSpyCalls(runSolverSpy, 1); // part 2 was not run
});

Deno.test("It should run part 2 if part 1 is not solved but part2.solve is true", async () => {
  const params = {
    part1: {
      solve: true,
      solver: () => `part1`,
      tests: [
        { input: "input", expected: "part1" },
      ],
    },
    part2: {
      solve: true,
      tests: [
        { input: "input", expected: "part1" },
      ],
      solver: () => `part2`,
    },
    day: 1,
    input: "input",
  } satisfies RunParams;

  using runTestsSpy = spy(_, "runTests");
  using runSolverSpy = spy(_, "runSolver");

  const config = new TestConfig({
    year: "2024",
    days: {
      "1": {
        part1: { solved: false, result: "test", tries: 1 },
        part2: { solved: false, tries: 0 },
      },
    },
  });
  await run(params, config);
  assertSpyCall(runTestsSpy, 0, {
    args: [params.part1],
    returned: ["part1"],
  });
  assertSpyCalls(runTestsSpy, 2); // part 2 was run
  assertSpyCalls(runSolverSpy, 2); // part 2 was run
});
