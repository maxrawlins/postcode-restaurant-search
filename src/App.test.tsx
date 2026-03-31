import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

type DeferredResponse = {
  promise: Promise<Response>;
  resolve: (value: Response) => void;
  reject: (error: Error) => void;
};

const createApiPayload = () => ({
  restaurants: [
    {
      name: "Pizza Place",
      cuisines: [{ name: "Pizza" }],
      rating: { starRating: 4.5 },
      address: {
        firstLine: "1 High Street",
        city: "London",
        postalCode: "SW1A 1AA",
      },
    },
  ],
});

const createRestaurantPayload = (index: number) => ({
  name: `Restaurant ${index}`,
  cuisines: [{ name: "Pizza" }],
  rating: { starRating: 4 },
  address: {
    firstLine: `${index} High Street`,
    city: "London",
    postalCode: "SW1A 1AA",
  },
});

const createDeferredResponse = (): DeferredResponse => {
  let resolve!: (value: Response) => void;
  let reject!: (error: Error) => void;

  const promise = new Promise<Response>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App submit and fetch process", () => {
  // shows a required message when postcode input is empty
  it("shows validation message for empty postcode", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("Please enter a postcode.")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // shows a validation message when postcode format is invalid
  it("shows validation message for invalid postcode", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter a UK postcode"), {
      target: { value: "INVALID" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(
      await screen.findByText("Please enter a valid UK postcode."),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // shows restaurant cards when the fetch call succeeds
  it("renders restaurant cards after successful fetch", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(createApiPayload()), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter a UK postcode"), {
      target: { value: "SW1A 1AA" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("Pizza Place")).toBeInTheDocument();
  });

  // shows no restaurants found when api returns an empty restaurant list
  it("shows no restaurants found message when api returns empty results", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ restaurants: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter a UK postcode"), {
      target: { value: "SW1A 1AA" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("No restaurants found.")).toBeInTheDocument();
  });

  // shows only the first 10 restaurant cards when api returns more than 10
  it("shows only the first 10 restaurants in the ui", async () => {
    const restaurants = Array.from({ length: 12 }, (_, index) =>
      createRestaurantPayload(index + 1),
    );

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ restaurants }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter a UK postcode"), {
      target: { value: "SW1A 1AA" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("Restaurant 1")).toBeInTheDocument();
    expect(screen.getByText("Restaurant 10")).toBeInTheDocument();
    expect(screen.queryByText("Restaurant 11")).not.toBeInTheDocument();
    expect(screen.queryByText("Restaurant 12")).not.toBeInTheDocument();
  });

  // shows an error message when fetch fails
  it("renders fetch error message when request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network failed"));

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter a UK postcode"), {
      target: { value: "SW1A 1AA" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(
      await screen.findByText("Unable to fetch restaurant data. Please try again!"),
    ).toBeInTheDocument();
  });

  // clears old error message after the next successful search
  it("clears previous error message after a successful search", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    fetchSpy.mockRejectedValueOnce(new Error("network failed"));
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(createApiPayload()), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter a UK postcode"), {
      target: { value: "SW1A 1AA" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(
      await screen.findByText("Unable to fetch restaurant data. Please try again!"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("Pizza Place")).toBeInTheDocument();
    expect(
      screen.queryByText("Unable to fetch restaurant data. Please try again!"),
    ).not.toBeInTheDocument();
  });

  // sends a cleaned postcode with no spaces in the request url
  it("calls fetch with cleaned postcode in url", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(createApiPayload()), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter a UK postcode"), {
      target: { value: " sw1a 1aa " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "http://localhost:3001/api/restaurants/SW1A1AA",
      );
    });
  });

  // shows loading first and then cards on a successful submit flow
  it("shows loading then shows cards on successful submit", async () => {
    const deferred = createDeferredResponse();
    vi.spyOn(globalThis, "fetch").mockReturnValue(deferred.promise);

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter a UK postcode"), {
      target: { value: "SW1A 1AA" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(screen.getByText("Loading restaurants...")).toBeInTheDocument();

    deferred.resolve(
      new Response(JSON.stringify(createApiPayload()), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(await screen.findByText("Pizza Place")).toBeInTheDocument();
    expect(screen.queryByText("Loading restaurants...")).not.toBeInTheDocument();
  });

  // shows loading first and then error on a failed submit flow
  it("shows loading then shows error on failed submit", async () => {
    const deferred = createDeferredResponse();
    vi.spyOn(globalThis, "fetch").mockReturnValue(deferred.promise);

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter a UK postcode"), {
      target: { value: "SW1A 1AA" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(screen.getByText("Loading restaurants...")).toBeInTheDocument();

    deferred.reject(new Error("request failed"));

    expect(
      await screen.findByText("Unable to fetch restaurant data. Please try again!"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Loading restaurants...")).not.toBeInTheDocument();
  });
});
