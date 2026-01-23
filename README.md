# BinSolver SDK

Official TypeScript/JavaScript SDK for the [BinSolver API](https://binsolver.com).

## Installation

```bash
npm install binsolver
# or
bun add binsolver
# or
yarn add binsolver
```

## Usage

```typescript
import { BinSolver } from "binsolver";

const client = new BinSolver("your-api-key");

// Check API health
const healthy = await client.health();

// Pack items
try {
  const result = await client.pack({
    objective: "minBins",
    bins: [
      { id: "box-small", w: 10, h: 10, d: 10, quantity: 10 },
      { id: "box-large", w: 20, h: 20, d: 20, quantity: 5 },
    ],
    items: [{ id: "item-1", w: 5, h: 5, d: 5, quantity: 12 }],
  });

  console.log(
    `Placed ${result.stats.placed} items in ${result.stats.binsUsed} bins.`,
  );

  for (const bin of result.bins) {
    console.log(
      `Bin ${bin.binId} (${bin.templateId}): ${bin.placements.length} items`,
    );
  }
} catch (error) {
  console.error("Packing failed:", error);
}
```

## Features

- **Fully Typed:** Generated from our OpenAPI specification.
- **Promise-based:** Async/await API.
- **Error Handling:** Throws descriptive errors for API failures.
- **Zero Config:** Works with Node.js, Bun, and modern browsers.

## License

MIT
