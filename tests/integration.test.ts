import { expect, test } from "bun:test";
import { BinSolver } from "../src/index";

const API_KEY = process.env.BINSOLVER_API_KEY;

test("Integration: pack() with real API", async () => {
  if (!API_KEY) {
    console.warn("Skipping integration test: BINSOLVER_API_KEY not set");
    return;
  }

  const sdk = new BinSolver(API_KEY);

  const isHealthy = await sdk.health();
  expect(isHealthy).toBe(true);

  const result = await sdk.pack({
    bins: [{ id: "box", w: 10, h: 10, d: 10 }],
    items: [{ id: "item", w: 5, h: 5, d: 5, quantity: 1 }],
    objective: "fast",
  });

  expect(result.stats.placed).toBe(1);
  expect(result.bins.length).toBe(1);
  expect(result.bins?.[0]?.placements.length).toBe(1);
});
