import { describe, it, expect } from "vitest";
import { isSafeOpPlatformUrl } from "../urlValidation";

describe("isSafeOpPlatformUrl", () => {
  it.each([
    "/resources",
    "/resources/blog/some-post",
    "https://paintedporchstrategies.com",
    "https://example.com/path?q=1#frag",
    "http://example.com/",
  ])("accepts safe url: %s", (url) => {
    expect(isSafeOpPlatformUrl(url)).toBe(true);
  });

  it.each([
    "",
    "   ",
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "data:text/html,<script>",
    "mailto:hi@example.com",
    "tel:+15555555555",
    "//evil.com/path",
    "not a url",
    "ftp://example.com/file",
    "/path with space",
    null,
    undefined,
    42,
    {},
  ])("rejects unsafe value: %p", (value) => {
    expect(isSafeOpPlatformUrl(value as unknown)).toBe(false);
  });
});
