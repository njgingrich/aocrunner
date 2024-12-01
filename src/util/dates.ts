import { Separator } from "@inquirer/prompts";

/**
 * Get the years that Advent of Code has been running.
 * @returns {Array<{ name: string, value: string }>} An array of objects with title and value properties.
 */
export function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const firstYear = 2015;

  const years = [];
  for (let year = currentYear; year >= firstYear; year--) {
    years.push({ name: `${year}`, value: `${year}` });
  }

  years.push(new Separator());

  return years;
}
