import type { InitConfig } from "../src/types.ts";
import project from "../deno.json" with { type: "json" };

const template = ({ year }: InitConfig) =>
  `{
  "description": "Advent of Code solutions for ${year}",
  "version": "1.0.0",
  "tasks": {
    "day": "aocrunner day"
  },
  "imports": {
    "@std/path": "jsr:@std/path@^1.0.8",
    "aocrunner": "jsr:@njgingrich/aocrunner@${project.version}"
  }
}
`;

export default template;
