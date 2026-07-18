/**
 * Unit tests for the API client module.
 * Run with: npx jest src/__tests__/api.test.ts
 */

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};
Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("API client", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorage.clear();
  });

  it("should add auth header when token exists", async () => {
    localStorage.setItem("access_token", "test-token");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: "ok" }),
    });

    const { api } = await import("@/lib/api");
    await api.get("/products");

    const callUrl = mockFetch.mock.calls[0][0];
    const callHeaders = mockFetch.mock.calls[0][1]?.headers;
    expect(callUrl).toContain("/products");
    expect(callHeaders?.Authorization).toBe("Bearer test-token");
  });

  it("should not include auth header for public endpoints", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: "ok" }),
    });

    const { api } = await import("@/lib/api");
    await api.post("/users/signin", { email: "test@test.com", password: "pass" }, false);

    const callHeaders = mockFetch.mock.calls[0][1]?.headers;
    // requestsAuth false should not add Authorization
    expect(callHeaders?.Authorization).toBeUndefined();
  });
});
