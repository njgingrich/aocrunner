import { Config } from "../src/types.ts";
import project from "../deno.json" with { type: "json" };

const template = ({ year }: Config) =>
  `{
  "name": "aoc${year}",
  "description": "Advent of Code solutions for ${year}",
  "version": 1.0.0,
  "tasks": {
    "day": "deno run aocrunner day"
  },
  "imports": {
    "aocrunner": "jsr:@njgingrich/aocrunner@${project.version}"
  }
}
`;

export default template;
