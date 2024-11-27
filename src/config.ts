import { join } from "@std/path";
import { deepMerge } from "@std/collections/deep-merge";
import type { AocConfig, DayConfig } from "./types.ts";
import { getProjectDir } from "./util/files.ts";

const EMPTY_CONFIG: AocConfig = {
    year: "",
    days: {},
}

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
    return this.#data.days[`${day}`] ?? {};
  }

  writeDay(day: number | string, dayConfig: Partial<DayConfig>) {
    const existingDay = this.getDay(day);
    const newDay = Object.assign({}, existingDay, dayConfig);
    return this.write({ days: { [`${day}`]: newDay } });
  }

  async write(data: Partial<AocConfig>) {
    this.#data = deepMerge<AocConfig>(this.#data, data);
    return Deno.writeTextFile(
      Config.configPath(),
      JSON.stringify(this.#data, null, 2)
    );
  }
}

let  _config: Config;

export async function getConfig() {
    if (_config) {
        return _config;
    }
    _config = await Config.load();
    return _config;
}

// export class MemoryConfig extends Config {
//     constructor(data?: NestedPartial<AocConfig>) {
//         super(data);
//     }
// }

// export class FileConfig extends Config {
//     constructor() {
//         const config = Deno.readTextFileSync(Config.configPath());
//         const data = JSON.parse(config);
//         super(data);
//     }
// }