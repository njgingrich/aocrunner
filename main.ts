import { cli } from "./src/cli/index.ts";
export { run } from "./src/run.ts";

if (import.meta.main) {
  cli();
}
