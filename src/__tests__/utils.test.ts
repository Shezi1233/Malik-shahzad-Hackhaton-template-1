import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges tailwind classes (last wins)", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});
