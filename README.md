# Runner

CLI tool to fetch and run AOC problems in Deno.

Warning! This is _absolutely_ not "ready for production". It has a lot of rough edges still. But if somebody does want to try it
and give some feedback feel free to create an issue!

## Use

- `aocrunner init`
- `cd {directory}`
- `aocrunner day 1`
- `aocrunner submit 1`

## Commands

### `init`

Create a new package for a given year of AoC. Will init a project setup in the provided directory
and install any dependencies.

### `day <day>`

Test & run solution for a given day, initializing the day from a template if it does not exist.

### `submit <day>`

Submit a solution for the given day.

## Future

- Custom templates
- Live functionality for `day` so tests can re-run, or solution can be submitted in an interactive TUI
