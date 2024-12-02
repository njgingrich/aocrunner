import { type Config, getConfig } from "../config.ts";
import type { DayConfig, Solution } from "../types.ts";
import { getDayDir } from "../util/files.ts";

interface PartTest {
  input: string;
  expected: Solution;
}

interface SolutionPart {
  tests?: PartTest[];
  solver: (input: string) => Solution;
  solve?: boolean;
}

export interface RunParams {
  part1: SolutionPart;
  part2: SolutionPart;
  input: string;
  day: number;
}

function runTests(part: SolutionPart): Solution[] {
  if (!part.tests) {
    throw new Error("Expected tests to be defined");
  }

  return part.tests.map(({ input, expected }: PartTest) => {
    const result = part.solver(input);
    console.log(
      `Test: ${result} should be ${expected} => ${result === expected ? "PASS" : "FAIL"}`,
    );

    return result;
  });
}

function runSolver(
  part: SolutionPart,
  input: string,
): { result: Solution; runtime: number } {
  // TODO: actually do runtime
  const result = part.solver(input);
  return { result, runtime: 0 };
}

export const _ = { runTests, runSolver };

/** Run the module for a day */
export async function runDay(day: number): Promise<number> {
  const dayDir = getDayDir(day);

  console.log(`Running Day ${day}`);
  const process = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-read", "--allow-write", "--allow-env", "main.ts"],
    cwd: dayDir,
  });

  const out = await process.output();
  const stdout = new TextDecoder().decode(out.stdout);
  console.log(stdout);

  if (!out.success) {
    const stderr = new TextDecoder().decode(out.stderr);
    console.log(stderr);
    return 1;
  } else {
    return 0;
  }
}
export type RunDayFn = typeof runDay;

/** The function the run module imports and calls */
export async function run(solutions: RunParams, config?: Config): Promise<void> {
  if (!config) {
    config = await getConfig();
  }

  // Default solve to be true unless passed as false
  solutions.part1.solve = solutions.part1.solve === false ? false : true;
  const output: DayConfig = config.getDay(solutions.day);

  if (solutions.part1.tests) {
    _.runTests(solutions.part1);
  }

  if (solutions.part1.solve === true) {
    const part1 = _.runSolver(solutions.part1, solutions.input);
    console.log(`Solve part 1: ${part1.result}`);

    output.part1.result = part1.result;
    output.part1.runtime = part1.runtime;
    output.part1.tries++;
  }

  if (solutions.part2.tests) {
    _.runTests(solutions.part2);
  }

  if (solutions.part2.solve === true) {
    const part2 = _.runSolver(solutions.part2, solutions.input);
    console.log(`Solve part 2: ${part2.result}`);

    output.part2.result = part2.result;
    output.part2.runtime = part2.runtime;
    output.part2.tries++;
  }

  console.log("Output:", output);
  config.writeDay(solutions.day, output);
}
