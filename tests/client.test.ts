import { describe, expect, test, mock, beforeEach } from "bun:test";
import { BinSolver } from "../src/index";
import type { PackResponse, PackRequest } from "../src/index";

describe("BinSolver SDK", () => {
  const API_KEY = "test-api-key";

  const mockFetch = mock();

  beforeEach(() => {
    mockFetch.mockReset();
  });

  test("instantiates correctly", () => {
    const sdk = new BinSolver(API_KEY);
    expect(sdk).toBeInstanceOf(BinSolver);
  });

  test("health() returns true on 200 OK", async () => {
    mockFetch.mockResolvedValue(new Response("ok", { status: 200 }));

    const sdk = new BinSolver(API_KEY, { fetch: mockFetch });
    const isHealthy = await sdk.health();

    expect(isHealthy).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const request = mockFetch?.mock?.calls?.[0]?.[0] as Request;
    expect(request.url).toContain("/health");
    expect(request.headers.get("x-api-key")).toBe(API_KEY);
  });

  test("health() returns false on non-200", async () => {
    mockFetch.mockResolvedValue(new Response("Server Error", { status: 500 }));

    const sdk = new BinSolver(API_KEY, { fetch: mockFetch });
    const isHealthy = await sdk.health();

    expect(isHealthy).toBe(false);
  });

  test("pack() sends correct request and returns data", async () => {
    const mockResponse: PackResponse = {
      bins: [],
      unplaced: [],
      stats: {
        items: 1,
        placed: 1,
        unplaced: 0,
        binsUsed: 1,
        durationMs: 10,
      },
    };

    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const sdk = new BinSolver(API_KEY, { fetch: mockFetch });

    const requestPayload: PackRequest = {
      bins: [{ w: 10, h: 10, d: 10 }],
      items: [{ w: 5, h: 5, d: 5, quantity: 1 }],
      objective: "minBins",
    };

    const result = await sdk.pack(requestPayload);

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const request = mockFetch?.mock?.calls?.[0]?.[0] as Request;
    expect(request.url).toContain("/pack");
    expect(request.headers.get("x-api-key")).toBe(API_KEY);

    const bodyText = await request.text();
    const sentBody = JSON.parse(bodyText);
    expect(sentBody).toEqual(requestPayload);
  });

  test("pack() throws formatted error on API failure", async () => {
    const errorBody = {
      error: {
        code: "INVALID_INPUT",
        message: "Items cannot be empty",
      },
    };

    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(errorBody), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const sdk = new BinSolver(API_KEY, { fetch: mockFetch });

    //intentional error: empty items
    const request: PackRequest = {
      bins: [{ w: 10, h: 10, d: 10 }],
      items: [],
      objective: "minBins",
    };

    const call = async () => await sdk.pack(request);

    expect(call).toThrow("Items cannot be empty");
  });
});
