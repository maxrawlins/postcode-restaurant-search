// @vitest-environment node
import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRestaurantsByPostcode } from "./index";

type PostcodeParams = {
  postcode: string;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/restaurants/:postcode", () => {
  const createMockResponse = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  const createMockRequest = (postcode: string) =>
    ({
      params: {
        postcode,
      },
    }) as unknown as Request<PostcodeParams>;

  // returns restaurant payload when upstream call is successful
  it("returns api data when upstream fetch succeeds", async () => {
    const payload = { restaurants: [{ name: "One" }] };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const req = createMockRequest("SW1A1AA");
    const res = createMockResponse();

    await getRestaurantsByPostcode(req, res);

    expect(res.json).toHaveBeenCalledWith(payload);
    expect(res.status).not.toHaveBeenCalled();
  });

  // returns upstream status when api responds with a non-ok result
  it("returns upstream status code when fetch is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "bad request" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const req = createMockRequest("SW1A1AA");
    const res = createMockResponse();

    await getRestaurantsByPostcode(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to fetch restaurants from API",
    });
  });

  // returns 500 when fetch throws an unexpected error
  it("returns 500 when fetch throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network failed"));

    const req = createMockRequest("SW1A1AA");
    const res = createMockResponse();

    await getRestaurantsByPostcode(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Something went wrong while fetching data from the API.",
    });
  });

  // removes spaces from postcode before calling the upstream api
  it("removes spaces from postcode before calling upstream api", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ restaurants: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const req = createMockRequest("SW1A 1AA");
    const res = createMockResponse();

    await getRestaurantsByPostcode(req, res);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://uk.api.just-eat.io/discovery/uk/restaurants/enriched/bypostcode/SW1A1AA",
    );
  });
});
