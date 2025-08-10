import { encodeUrlQueryParams } from "../src/tools/url/lib/url";

describe("encodeUrlQueryParams", () => {
  it("encodes query values", () => {
    const url = "https://example.com/path?name=John Doe&city=New York";
    expect(encodeUrlQueryParams(url)).toBe(
      "https://example.com/path?name=John%20Doe&city=New%20York",
    );
  });

  it("handles custom schemes", () => {
    const url = "trueapp://host/path?foo=bar baz";
    expect(encodeUrlQueryParams(url)).toBe("trueapp://host/path?foo=bar%20baz");
  });

  it("preserves already encoded values", () => {
    const url = "https://example.com/path?name=John%20Doe";
    expect(encodeUrlQueryParams(url)).toBe("https://example.com/path?name=John%20Doe");
  });

  it("encodes URLs without scheme", () => {
    const url = "example.com/path?term=hello world#frag";
    expect(encodeUrlQueryParams(url)).toBe("example.com/path?term=hello%20world#frag");
  });

  it("handles plus signs and empty params", () => {
    const url = "https://ex.com/?a=1%2B2&a=&b";
    expect(encodeUrlQueryParams(url)).toBe("https://ex.com/?a=1%2B2&a=&b=");
  });
});

