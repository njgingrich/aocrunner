import { join } from "@std/path";
import { deepMerge } from "@std/collections/deep-merge";
import type { AocConfig, DayConfig } from "./types.ts";
import { getProjectDir } from "./util/files.ts";

const EMPTY_CONFIG: AocConfig = {
  year: "",
  days: {},
};

const EMPTY_DAY: DayConfig = {
  part1: {
    solved: false,
    tries: 0,
  },
  part2: {
    solved: false,
    tries: 0,
  },
};

export class Config {
  #data: AocConfig;

  constructor(data?: NestedPartial<AocConfig>) {
    this.#data = Object.assign({}, EMPTY_CONFIG, data);
  }

  static async load(initialData?: AocConfig, path = Config.configPath()): Promise<Config> {
    const config = await Deno.readTextFile(path);
    const data = JSON.parse(config);
    // @ts-expect-error - IDK why deepMerge hates me
    const mergedData = deepMerge<AocConfig>(data, initialData);
    return new Config(mergedData);
  }

  static configPath(): string {
    return join(getProjectDir(), ".aoc.json");
  }

  get(): AocConfig {
    return this.#data;
  }

  getDay(day: number | string): DayConfig {
    return this.#data.days[`${day}`] ?? EMPTY_DAY;
  }

  writeDay(day: number | string, dayConfig: Partial<DayConfig>): Promise<void> {
    const existingDay = this.getDay(day);
    const newDay = Object.assign({}, existingDay, dayConfig);
    return this.write({ days: { [`${day}`]: newDay } });
  }

  /** Only exposed for testing */
  setData(data: AocConfig) {
    this.#data = data;
  }

  write(data: Partial<AocConfig>): Promise<void> {
    // @ts-expect-error - IDK why deepMerge hates me
    this.setData(deepMerge<AocConfig>(this.#data, data));
    return Deno.writeTextFile(
      Config.configPath(),
      JSON.stringify(this.#data, null, 2),
    );
  }
}

let _config: Config;

/**
 * Get the config for a project. If done outside of a specific project (like when
 * initing a new project) you can pass in a path to the project root.
 *
 * @param overridePath An optional path (to the project root) for the config file
 * @returns
 */
export async function getConfig(overridePath?: string): Promise<Config> {
  if (_config) {
    return _config;
  }
  _config = await Config.load(undefined, overridePath);
  return _config;
}

/** A config class you can use for testing that stubs out the actual writes */
export class TestConfig extends Config {
  static override load(testData?: AocConfig): Promise<Config> {
    const config = testData ?? EMPTY_CONFIG;
    return Promise.resolve(new TestConfig(config));
  }

  override write(data: Partial<AocConfig>): Promise<void> {
    // @ts-expect-error - IDK why deepMerge hates me
    this.setData(deepMerge<AocConfig>(this.get(), data));
    return Promise.resolve();
  }
}
