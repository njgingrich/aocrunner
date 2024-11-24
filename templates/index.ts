import dayTemplate from "./main.ts.ts";
import denoJsonTemplate from "./deno.json.ts";
import envTemplate from "./.env.ts";

const TEMPLATE_MAP = {
  "template/main.ts": dayTemplate,
  "deno.json": denoJsonTemplate,
  ".env": envTemplate,
};

export { TEMPLATE_MAP };
