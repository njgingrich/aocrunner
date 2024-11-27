import { assertSpyCall, assertSpyCalls, spy } from "@std/testing/mock";
import { ApiClient } from "./client.ts";
import { assertEquals } from "@std/assert/equals";
import { SubmitResult } from "./types.ts";

function getFixturesPath() {
  return `${Deno.cwd()}/test/fixtures`;
}

Deno.test("Can request input", () => {
  const client = new ApiClient({
    baseUrl: "https://www.example.com",
    sessionToken: "testtoken",
    year: 2024,
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
    sessionToken: "testtoken",
    year: 2024,
  });

  const fetchSpy = (globalThis.fetch = spy(() => {
    const text = Deno.readTextFileSync(
      `${getFixturesPath()}/correct_response.html`,
    );
    return Promise.resolve(new Response(text));
  }));

  const resp = await client.submit(1, 1, "result");
  assertEquals(resp, { type: SubmitResult.SUCCESS });
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
    sessionToken: "testtoken",
    year: 2024,
  });

  const fetchSpy = (globalThis.fetch = spy(() => {
    return Promise.resolve(new Response("test", { status: 400 }));
  }));

  const resp = await client.submit(1, 1, "result");
  assertEquals(resp, { type: SubmitResult.TOKEN_ERROR });
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
    sessionToken: "",
    year: 2024,
  });

  const fetchSpy = (globalThis.fetch = spy(() => Promise.resolve(new Response("test"))));

  const resp = await client.submit(1, 1, "result");
  assertEquals(resp, { type: SubmitResult.TOKEN_ERROR });
  assertSpyCalls(fetchSpy, 0);
});

Deno.test("Will return ratelimit response if too many requests are made", async () => {
  const client = new ApiClient({
    baseUrl: "https://www.example.com",
    sessionToken: "testtoken",
    year: 2024,
  });

  const fetchSpy = (globalThis.fetch = spy(() => {
    const text = Deno.readTextFileSync(
      `${getFixturesPath()}/too_recent_response.html`,
    );
    return Promise.resolve(new Response(text));
  }));

  const resp = await client.submit(1, 1, "result");
  assertEquals(resp, { type: SubmitResult.RATE_LIMIT, delayMs: 60_000 });
});
