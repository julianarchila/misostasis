import { expect, test } from "vitest"
import { DBTest } from "./util"
import { Effect, Layer } from "effect"
import { UserRepository } from "@/server/repositories/user"

test("should create a new todo with correct default values", async () => {
  const program = Effect.gen(function* () {
    const newUser = yield* UserRepository.create({ 
      clerk_id: "clerk-fake-id",
      email: "fake@email.com",
      fullName: "Fake User",
      role: "explorer"
    })
    return newUser
  })

  const testLayer = Layer.provide(UserRepository.DefaultWithoutDependencies, DBTest)

  const result = await Effect.runPromise(program.pipe(Effect.provide(testLayer)))

  expect(result).toBeDefined()

  expect(result.role).toBe("explorer")
  expect(result.email).toBe("fake@email.com")
})