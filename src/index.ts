import createClient, { type ClientOptions } from "openapi-fetch";
import type { paths, components } from "./schema";

export type PackRequest = components["schemas"]["PackRequest"];
export type PackResponse = components["schemas"]["PackResponse"];
export type ItemInput = components["schemas"]["ItemInput"];
export type BinInput = components["schemas"]["BinInput"];
export type BinResult = components["schemas"]["BinResult"];
export type Placement = components["schemas"]["Placement"];
export type PackStats = components["schemas"]["PackStats"];

export class BinSolver {
  public client;

  constructor(apiKey: string, options: ClientOptions = {}) {
    this.client = createClient<paths>({
      baseUrl: "https://api.binsolver.com",
      ...options,
      headers: {
        ...options.headers,
        "x-api-key": apiKey,
      },
    });
  }

  /**
   * Pack items into bins.
   * Throws an error if the API returns a non-200 response.
   */
  async pack(request: PackRequest): Promise<PackResponse> {
    const { data, error } = await this.client.POST("/pack", {
      body: request,
    });

    if (error) {
      const errResponse = error as components["schemas"]["ErrorResponse"];
      const msg =
        errResponse.error?.message || "Unknown error occurred during packing";
      throw new Error(msg);
    }

    return data!;
  }

  /**
   * Check if the service is healthy.
   */
  async health(): Promise<boolean> {
    const { response } = await this.client.GET("/health", {
      parseAs: "text",
    });
    return response.ok;
  }
}
