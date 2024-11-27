import { assertEquals } from "@std/assert";
import { assertSpyCall, resolvesNext, stub } from "@std/testing/mock";
import { Config } from "./config.ts";
import { AocConfig } from "./types.ts";

Deno.test("Writing config", async () => {
  const baseConfig = {
    year: "2024",
    days: {},
  } satisfies AocConfig;
  const config = new Config(baseConfig);

  // const readTextFileStub = stub(
  //   Deno,
  //   "readTextFile",
  //   resolvesNext([JSON.stringify(baseConfig)]),
  // );
  const writeSpy = stub(Deno, "writeTextFile");

  const dayConfig = {
    1: {
      part1: {
        solved: true,
        result: 123,
        tries: 1,
        runtime: 112,
      },
      part2: {
        solved: false,
        result: undefined,
        tries: 0,
      },
    },
  };

  await config.write({ days: dayConfig });
  assertSpyCall(writeSpy, 0, {
    args: [
      `${Deno.cwd()}/.aoc.json`,
      JSON.stringify(
        {
          year: "2024",
          days: dayConfig,
        },
        null,
        2,
      ),
    ],
  });

  // readTextFileStub.restore();
  writeSpy.restore();
});

Deno.test("Writing new day config", async () => {
  const baseConfig = {
    year: "2024",
    days: {
      1: {
        part1: {
          solved: true,
          result: 123,
          tries: 1,
          runtime: 112,
        },
        part2: {
          solved: false,
          result: undefined,
          tries: 0,
        },
      },
    },
  } satisfies AocConfig;
  const config = new Config(baseConfig);

  const readTextFileStub = stub(
    Deno,
    "readTextFile",
    resolvesNext([JSON.stringify(baseConfig)]),
  );
  const writeSpy = stub(Deno, "writeTextFile");

  const dayConfig = {
    part1: {
      solved: true,
      result: 123,
      tries: 1,
      runtime: 112,
    },
    part2: {
      solved: false,
      tries: 0,
    },
  };

  await config.writeDay(2, dayConfig);
  assertEquals(JSON.parse(writeSpy.calls[0].args[1] as string), {
    year: "2024",
    days: {
      1: {
        part1: {
          solved: true,
          result: 123,
          tries: 1,
          runtime: 112,
        },
        part2: {
          solved: false,
          tries: 0,
        },
      },
      2: dayConfig,
    },
  });

  readTextFileStub.restore();
  writeSpy.restore();
});

Deno.test("Overwrites existing day", async () => {
  const baseConfig = {
    year: "2024",
    days: {
      1: {
        part1: {
          solved: true,
          result: 123,
          tries: 1,
          runtime: 112,
        },
        part2: {
          solved: false,
          tries: 0,
        },
      },
    },
  } satisfies AocConfig;
  const config = new Config(baseConfig);

  const readTextFileStub = stub(
    Deno,
    "readTextFile",
    resolvesNext([JSON.stringify(baseConfig)]),
  );
  const writeSpy = stub(Deno, "writeTextFile");

  const newConfig = {
    part2: {
      solved: true,
      result: 3,
      tries: 1,
      runtime: 123,
    },
  };

  await config.writeDay(1, newConfig);
  assertEquals(JSON.parse(writeSpy.calls[0].args[1] as string), {
    year: "2024",
    days: {
      1: {
        part1: {
          solved: true,
          result: 123,
          tries: 1,
          runtime: 112,
        },
        ...newConfig,
      },
    },
  });

  readTextFileStub.restore();
  writeSpy.restore();
});
