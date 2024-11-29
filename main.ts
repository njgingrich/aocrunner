import { cli } from "./src/cli/index.ts";
export { run } from "./src/actions/run.ts";

if (import.meta.main) {
  cli();
}
