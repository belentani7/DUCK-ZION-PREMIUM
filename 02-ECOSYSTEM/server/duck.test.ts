/**
 * DUCK ECOSYSTEM · AUTOMATED TEST SUITE
 * Test Architecture & Verification by Pedro Belentani · Canal Zion 2026
 */
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "duck-admin",
      email: "duck-beats@hotmail.com",
      name: "Duck Producer",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Duck Ecosystem Router Tests", () => {
  it("fetches tracks successfully", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const tracks = await caller.duck.getTracks();
    expect(Array.isArray(tracks)).toBe(true);
    expect(tracks.length).toBeGreaterThan(0);
  });

  it("fetches singles successfully", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const singles = await caller.duck.getSingles();
    expect(Array.isArray(singles)).toBe(true);
    expect(singles.length).toBe(5);
  });
});
