import { join } from "@std/path";
import { deepMerge } from "@std/collections/deep-merge";
import { AocConfig } from "./types.ts";
import { getProjectDir } from "./util/files.ts";

function configPath(): string {
  return join(getProjectDir(), ".aoc.json");
}

export async function createConfig(): Promise<void> {
  return Deno.writeTextFile(configPath(), "{}");
}

export async function getConfig(): Promise<AocConfig> {
  const config = await Deno.readTextFile(configPath());
  console.log(config);
  return JSON.parse(config);
}

export async function writeConfig(
  config: NestedPartial<AocConfig>,
): Promise<void> {
  const existingConfig = await getConfig();
  // @ts-expect-error - idk why it's mad here
  const newConfig = deepMerge<AocConfig>(existingConfig, config);
  return Deno.writeTextFile(configPath(), JSON.stringify(newConfig, null, 2));
}

export async function writeDayConfig(
  day: number,
  dayConfig: Partial<AocConfig["days"][number]>,
): Promise<void> {
  return writeConfig({ days: { [day]: dayConfig } });
}
