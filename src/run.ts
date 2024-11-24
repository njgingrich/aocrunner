interface PartTest {
  input: string;
  expected: string;
}

interface SolutionPart {
  tests?: PartTest[];
  solver: (input: string) => string | number | undefined;
  solve?: boolean;
}

interface Solutions {
  part1: SolutionPart;
  part2: SolutionPart;
  input: string;
}

function runTests(part: SolutionPart): void {
  if (!part.tests) {
    throw new Error("Expected tests to be defined");
  }

  part.tests.forEach(({ input, expected }: PartTest) => {
    const result = part.solver(input);
    console.log(
      `Test: ${result} should be ${expected} => ${result === expected ? "PASS" : "FAIL"}`,
    );
  });
}

export function run(solutions: Solutions): void {
  // Default solve to be true unless passed as false
  solutions.part1.solve = solutions.part1.solve === false ? false : true;

  if (solutions.part1.tests) {
    runTests(solutions.part1);
  }

  if (solutions.part1.solve === true) {
    console.log(`Solve part 1: ${solutions.part1.solver(solutions.input)}`);
  }

  if (solutions.part2.tests) {
    runTests(solutions.part2);
  }

  if (solutions.part2.solve === true) {
    console.log(`Solve part 2: ${solutions.part2.solver(solutions.input)}`);
  }
}
