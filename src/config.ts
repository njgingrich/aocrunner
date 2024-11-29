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

  static async load(): Promise<Config> {
    const config = await Deno.readTextFile(Config.configPath());
    const data = JSON.parse(config);
    return new Config(data);
  }

  static configPath() {
    return join(getProjectDir(), ".aoc.json");
  }

  get(): AocConfig {
    return this.#data;
  }

  getDay(day: number | string): DayConfig {
    return this.#data.days[`${day}`] ?? EMPTY_DAY;
  }

  writeDay(day: number | string, dayConfig: Partial<DayConfig>) {
    const existingDay = this.getDay(day);
    const newDay = Object.assign({}, existingDay, dayConfig);
    return this.write({ days: { [`${day}`]: newDay } });
  }

  /** Only exposed for testing */
  setData(data: AocConfig) {
    this.#data = data;
  }

  async write(data: Partial<AocConfig>) {
    // @ts-expect-error - IDK why deepMerge hates me
    this.setData(deepMerge<AocConfig>(this.#data, data));
    return Deno.writeTextFile(
      Config.configPath(),
      JSON.stringify(this.#data, null, 2),
    );
  }
}

let _config: Config;

export async function getConfig() {
  if (_config) {
    return _config;
  }
  _config = await Config.load();
  return _config;
}

/** A config class you can use for testing that stubs out the actual writes */
export class TestConfig extends Config {
  static override async load(testData?: AocConfig): Promise<Config> {
    const config = testData ?? EMPTY_CONFIG;
    return new TestConfig(config);
  }

  override async write(data: Partial<AocConfig>) {
    // @ts-expect-error - IDK why deepMerge hates me
    this.setData(deepMerge<AocConfig>(this.get(), data));
  }
}
