const template = `
import { run } from "aocrunner";
import { parse, SEPARATOR } from "@std/path";

function getRawInput(): Promise<string> {
  return Deno.readTextFile("input.txt");
}

function getDay(): number {
  // TODO: extract to util function we import
  const module = import.meta.url;
  const parsed = parse(module);
  const dayString = parsed.dir.split(SEPARATOR).pop();
  return Number(dayString.slice(-2));
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
  day: getDay(),
});
`;

export default template;
