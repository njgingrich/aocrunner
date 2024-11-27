export type InitConfig = {
  year: string;
  directory: string;
};

interface PartConfig {
  solved: boolean;
  result?: any;
  tries: number;
  runtime?: number;
}

export interface DayConfig {
  part1: PartConfig;
  part2: PartConfig;
}

export interface AocConfig extends Record<PropertyKey, unknown> {
  year: string;
  days: Record<string, DayConfig>;
}
