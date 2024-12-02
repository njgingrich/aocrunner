export type Solution = string | number | undefined;

export type InitConfig = {
  year: string;
  directory: string;
};

interface PartConfig {
  solved: boolean;
  result?: Solution;
  tries: number;
  runtime?: number;
}

export interface DayConfig {
  part1: PartConfig;
  part2: PartConfig;
}

export interface AocConfig {
  year: string;
  days: Record<string, DayConfig>;

  prevSubmitTimestamp?: number;
  submitDelayMs?: number;
}
