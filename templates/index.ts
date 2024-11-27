import dayTemplate from "./main.ts.ts";
import denoJsonTemplate from "./deno.json.ts";
import envTemplate from "./.env.ts";
import gitignoreTemplate from "./.gitignore.ts";

const TEMPLATE_MAP = {
  "template/main.ts": dayTemplate,
  "deno.json": denoJsonTemplate,
  ".env": envTemplate,
  ".gitignore": gitignoreTemplate,
  ".aoc.json": "{}",
};

export { TEMPLATE_MAP };
