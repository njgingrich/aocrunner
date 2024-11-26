const template = `
import { run } from "aocrunner";

function getRawInput(): Promise<string> {
  return Deno.readTextFile("input.txt");
}

function getDay(): Promise<number> {
  const module = import.meta.url;
  // TODO: use path.parse
  const parts = module.split("/");
  const dayString = parts.at(-1);
  return Number(day.slice(-2));
}

function parseInput(rawInput: string): string {
  return rawInput;
}

function part1(rawInput: string) {
  const input = parseInput(rawInput);
  return undefined;
}

function part2(rawInput: string) {
  const input = parseInput(rawInput);
  return undefined;
}

run({
  part1: {
    tests: [
      {
        input: "",
        expected: "",
      },
    ],
    solver: part1,
    solve: false,
  },
  part2: {
    tests: [
      {
        input: "",
        expected: "",
      },
    ],
    solver: part2,
    solve: false,
  },
  input: await getRawInput(),
  day: await getDay(),
});
`;

export default template;
