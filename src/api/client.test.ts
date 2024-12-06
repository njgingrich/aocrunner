// deno-lint-ignore-file no-unused-vars
import { assertEquals } from "@std/assert/equals";
import { assertSpyCall, assertSpyCalls, spy } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";

import { ApiClient } from "./client.ts";
import { ApiResult } from "./types.ts";
import { TestConfig } from "../config.ts";

function getFixturesPath() {
  return `${Deno.cwd()}/test/fixtures`;
}

Deno.test("Can request input", () => {
  const client = new ApiClient({
    baseUrl: "https://www.example.com",
    config: new TestConfig({ year: "2024" }),
    sessionToken: "testtoken",
  });

  const fetchSpy = globalThis.fetch = spy(() => Promise.resolve(new Response("test")));

  client.getInput(1);
  assertSpyCall(fetchSpy, 0, {
    args: [
      new URL("https://www.example.com/2024/day/1/input"),
      {
        method: "GET",
        headers: {
          cookie: `session=testtoken`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "https://github.com/njgingrich/aocrunner by njgingrich@gmail.com",
        },
      },
    ],
  });
});

Deno.test("Can submit solution", async () => {
  const client = new ApiClient({
    baseUrl: "https://www.example.com",
    config: new TestConfig({ year: "2024" }),
    sessionToken: "testtoken",
  });

  const fetchSpy = (globalThis.fetch = spy(() => {
    const text = Deno.readTextFileSync(
      `${getFixturesPath()}/correct_response.html`,
    );
    return Promise.resolve(new Response(text));
  }));

  const resp = await client.submit(1, 1, "result");
  assertEquals(resp, { type: ApiResult.SUCCESS });
  assertSpyCall(fetchSpy, 0, {
    args: [
      new URL("https://www.example.com/2024/day/1/answer"),
      {
        method: "POST",
        headers: {
          cookie: `session=testtoken`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "https://github.com/njgingrich/aocrunner by njgingrich@gmail.com",
        },
        body: "level=1&answer=result",
      },
    ],
  });
});

Deno.test("Will return an error if session token is invalid", async () => {
  const client = new ApiClient({
    baseUrl: "https://www.example.com",
    config: new TestConfig({ year: "2024" }),
    sessionToken: "testtoken",
  });

  const fetchSpy = (globalThis.fetch = spy(() => {
    return Promise.resolve(new Response("test", { status: 400 }));
  }));

  const resp = await client.submit(1, 1, "result");
  assertEquals(resp.type, ApiResult.TOKEN_ERROR);
  assertSpyCall(fetchSpy, 0, {
    args: [
      new URL("https://www.example.com/2024/day/1/answer"),
      {
        method: "POST",
        headers: {
          cookie: `session=testtoken`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "https://github.com/njgingrich/aocrunner by njgingrich@gmail.com",
        },
        body: "level=1&answer=result",
      },
    ],
  });
});

Deno.test("Will return token error if session token is empty", async () => {
  const client = new ApiClient({
    baseUrl: "https://www.example.com",
    config: new TestConfig({ year: "2024" }),
    sessionToken: "",
  });

  const fetchSpy = (globalThis.fetch = spy(() => Promise.resolve(new Response("test"))));

  const resp = await client.submit(1, 1, "result");
  assertEquals(resp.type, ApiResult.TOKEN_ERROR);

  // We should not request the server if there's no token
  assertSpyCalls(fetchSpy, 0);
});

Deno.test("Will return error response if submission is already solved", async () => {
  const client = new ApiClient({
    baseUrl: "https://www.example.com",
    config: new TestConfig({ year: "2024" }),
    sessionToken: "testtoken",
  });

  const fetchSpy = (globalThis.fetch = spy(() => {
    const text = Deno.readTextFileSync(
      `${getFixturesPath()}/already_solved_response.html`,
    );
    return Promise.resolve(new Response(text));
  }));

  const resp = await client.submit(1, 1, "result");
  assertEquals(resp.type, ApiResult.ERROR);
  // @ts-expect-error - doesn't always have error
  assertEquals(resp?.error?.message, "Already completed");
});

Deno.test("Will return ratelimit response if too many requests are made", async () => {
  const client = new ApiClient({
    baseUrl: "https://www.example.com",
    config: new TestConfig({ year: "2024" }),
    sessionToken: "testtoken",
  });

  const fetchSpy = (globalThis.fetch = spy(() => {
    const text = Deno.readTextFileSync(
      `${getFixturesPath()}/too_recent_response.html`,
    );
    return Promise.resolve(new Response(text));
  }));

  const resp = await client.submit(1, 1, "result");
  assertEquals(resp, { type: ApiResult.RATE_LIMIT, delayMs: 60_000 });
});

Deno.test("Will return ratelimit response if delay is already set", async () => {
  using time = new FakeTime();

  const client = new ApiClient({
    baseUrl: "https://www.example.com",
    config: new TestConfig({ submitDelayMs: 60_000, prevSubmitTimestamp: Date.now() - 5000 }),
    sessionToken: "testtoken",
  });

  const fetchSpy = (globalThis.fetch = spy(() => {
    return Promise.resolve(new Response("test"));
  }));

  const resp = await client.submit(1, 1, "result");
  // existing remaining delay of 55s - prev submit was 5s ago, set it to 60s
  assertEquals(resp, { type: ApiResult.RATE_LIMIT, delayMs: 55_000 });
});

Deno.test("It updates delay when a failure response is given", async () => {
  using time = new FakeTime();

  const config = new TestConfig({ year: "2024" });
  const client = new ApiClient({
    baseUrl: "https://www.example.com",
    config,
    sessionToken: "testtoken",
  });

  const fetchSpy = (globalThis.fetch = spy(() => {
    const text = Deno.readTextFileSync(
      `${getFixturesPath()}/incorrect_response.html`,
    );
    return Promise.resolve(new Response(text));
  }));

  const resp = await client.submit(1, 1, "result");
  assertEquals(resp, { type: ApiResult.FAILURE });
  assertEquals(config.get().submitDelayMs, 60_000);
});

Deno.test("It updates config when a submission is made", async () => {
  using time = new FakeTime();

  const config = new TestConfig({ year: "2024" });
  const client = new ApiClient({
    baseUrl: "https://www.example.com",
    config,
    sessionToken: "testtoken",
  });

  const fetchSpy = (globalThis.fetch = spy(() => {
    const text = Deno.readTextFileSync(
      `${getFixturesPath()}/correct_response.html`,
    );
    return Promise.resolve(new Response(text));
  }));

  await client.submit(1, 1, "result");
  const confData = config.get();
  assertEquals(confData.prevSubmitTimestamp, Date.now());
  assertEquals(confData.submitDelayMs, 60_000);
});

Deno.test("It updates existing delay when new submit attempt is made", async () => {
  using time = new FakeTime();

  const config = new TestConfig({ submitDelayMs: 60_000, prevSubmitTimestamp: Date.now() - 5000 });
  const client = new ApiClient({
    baseUrl: "https://www.example.com",
    config,
    sessionToken: "testtoken",
  });

  time.tick(6000);

  const fetchSpy = (globalThis.fetch = spy(() => {
    return Promise.resolve(new Response("test"));
  }));

  const resp = await client.submit(1, 1, "result");
  const confData = config.get();
  // Sends new delay of 55s - 6s
  assertEquals(resp, { type: ApiResult.RATE_LIMIT, delayMs: 49_000 });
  assertEquals(confData.prevSubmitTimestamp, Date.now());
  assertEquals(confData.submitDelayMs, 49_000);
});
