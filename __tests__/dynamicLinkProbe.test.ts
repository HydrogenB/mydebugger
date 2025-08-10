import { parseQueryParams, storeTrace, loadTrace } from "../src/tools/dynamic-link-probe/lib/dynamicLink";

describe("dynamic link utilities", () => {
  it("parses query parameters", () => {
    expect(parseQueryParams("?a=1&b=2")).toEqual({ a: "1", b: "2" });
    expect(parseQueryParams("")).toEqual({});
  });

  it("stores and loads trace", () => {
    const trace = { params: { x: "1" }, sourceUrl: "https://x", timestamp: 1 };
    storeTrace(trace);
    expect(loadTrace()).toEqual(trace);
  });

  afterEach(() => {
    sessionStorage.clear();
  });
});
