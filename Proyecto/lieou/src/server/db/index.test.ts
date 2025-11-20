import { vi, describe, it, expect, beforeEach } from "vitest"

vi.mock("drizzle-orm/node-postgres", () => {
  return {
    drizzle: vi.fn(() => ({ mocked: true }))
  }
})

import { drizzle } from "drizzle-orm/node-postgres"

describe("getDb()", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // limpiar cache del módulo para que getDb() reinicie `instance`
    vi.resetModules()
  })

  it("crea una instancia la primera vez", async () => {
    const { getDb } = await import("./index")
    const db = getDb()
    expect(db).toEqual({ mocked: true })
    expect(drizzle).toHaveBeenCalledOnce()
  })

  it("devuelve la misma instancia en llamadas posteriores", async () => {
    const { getDb } = await import("./index")
    const first = getDb()
    const second = getDb()
    expect(first).toBe(second)
    expect(drizzle).toHaveBeenCalledOnce()
  })
})