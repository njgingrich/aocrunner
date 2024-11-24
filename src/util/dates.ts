/**
 * Get the years that Advent of Code has been running.
 * @returns {Array<{ title: string, value: string }>} An array of objects with title and value properties.
 */
export function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const firstYear = 2015;

  const years = [];
  for (let year = currentYear; year >= firstYear; year--) {
    years.push({ title: `${year}`, value: `${year}` });
  }

  return years;
}
