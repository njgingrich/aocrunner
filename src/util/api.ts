export async function getInput() {
  return "test";
}

export async function submitSolution(day: number, part: 1 | 2, solution: any) {
  console.log(`Submitting solution for day ${day}, part ${part}: ${solution}`);
}
export type SubmitSolutionFn = typeof submitSolution;
