import { describe, it, expect } from "vitest";
import { formatResponse } from "../../src/utils/response";

describe("Response Formatter", () => {
  it("formats a successful response with payload data", () => {
    const data = { id: 1, name: "Alice" };
    const res = formatResponse(true, "Data fetched", data);

    expect(res).toEqual({
      success: true,
      message: "Data fetched",
      data: { id: 1, name: "Alice" },
    });
  });

  it("formats an error response without data key", () => {
    const res = formatResponse(false, "Operation failed");

    expect(res).toEqual({
      success: false,
      message: "Operation failed",
    });
    expect(res.data).toBeUndefined();
  });

  it("includes optional meta when provided", () => {
    const meta = { total: 50, page: 1 };
    const res = formatResponse(true, "Paginated list", [1, 2, 3], meta);

    expect(res.meta).toEqual({ total: 50, page: 1 });
  });
});
