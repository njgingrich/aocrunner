export type Config = {
  year: string;
  directory: string;
};

interface PartConfig {
  solved: boolean;
  result?: any;
  tries: number;
  runtime?: number;
}

interface DayConfig {
  part1: PartConfig;
  part2: PartConfig;
}

export interface AocConfig {
  year: string;
  days: Record<number, DayConfig>;
}
