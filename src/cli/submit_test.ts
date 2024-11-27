import { assertSpyCall, returnsNext, spy, stub } from "@std/testing/mock";
import { Config } from "../config.ts";
import { AocConfig } from "../types.ts";
import { submit } from "./submit.ts";
import { assertEquals } from "@std/assert/equals";
import { CliArgs } from "./index.ts";

Deno.test("It should say already solved if part 2 is solved", async () => {
    const solvedConfig = {
        year: "2024",
        days: {
            "1": {
                part1: {
                    solved: true,
                    result: 123,
                    tries: 1,
                    runtime: 112,
                },
                part2: {
                    solved: true,
                    result: 456,
                    tries: 1,
                    runtime: 112,
                },
            },
        }
    } as const satisfies AocConfig;

    const config = new Config(solvedConfig);
    const consoleSpy = spy(console, "log");

    const result = await submit({ _: ["submit", "1"] } as CliArgs, config);
    assertEquals(result, 0);
    assertSpyCall(consoleSpy, 0, { args: ["Part 2 already solved!"] });
});
