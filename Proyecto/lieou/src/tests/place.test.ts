import { expect, test } from "vitest"
import { Effect, Layer } from "effect"
import { DBTest } from "./util"
import { PlaceRepository } from "@/server/repositories/place"
import { UserRepository } from "@/server/repositories/user"

const repositoryLayer = Layer.mergeAll(
  UserRepository.DefaultWithoutDependencies,
  PlaceRepository.DefaultWithoutDependencies,
)

const testLayer = Layer.provide(repositoryLayer, DBTest)

const createBusinessUser = (suffix: string) =>
  UserRepository.create({
    clerk_id: `clerk-business-${suffix}`,
    email: `business-${suffix}@example.com`,
    fullName: `Business ${suffix}`,
    role: "business",
  })

// NOTE: These tests are skipped because pglite does not support PostGIS
// geometry types. The schema uses PostGIS for coordinates column.
// To run these tests, use a real PostgreSQL database with PostGIS extension.

test.skip("creates a place for a business user", async () => {
  const program = Effect.gen(function* () {
    const business = yield* createBusinessUser("create")

    const place = yield* PlaceRepository.create({
      business_id: business.id,
      name: "Test Place",
      description: "Great place for testing",
      // coordinates skipped - PostGIS not available in pglite
      address: "Test Address",
    })

    return { business, place }
  })

  const { place, business } = await Effect.runPromise(
    program.pipe(Effect.provide(testLayer)),
  )

  expect(place).toBeDefined()
  expect(place.id).toBeDefined()
  expect(place.business_id).toBe(business.id)
  expect(place.name).toBe("Test Place")
})

test.skip("findByBusinessId returns only places for the given business", async () => {
  const program = Effect.gen(function* () {
    const businessOne = yield* createBusinessUser("one")
    const businessTwo = yield* createBusinessUser("two")

    yield* PlaceRepository.create({
      business_id: businessOne.id,
      name: "Cafe Uno",
      description: "Coffee spot",
      // coordinates skipped - PostGIS not available in pglite
      address: "Cafe Uno Address",
    })

    yield* PlaceRepository.create({
      business_id: businessOne.id,
      name: "Cafe Dos",
      description: "Second coffee spot",
      // coordinates skipped - PostGIS not available in pglite
      address: "Cafe Dos Address",
    })

    yield* PlaceRepository.create({
      business_id: businessTwo.id,
      name: "Cafe Tres",
      description: "Another coffee spot",
      // coordinates skipped - PostGIS not available in pglite
      address: "Cafe Tres Address",
    })

    const placesForBusinessOne = yield* PlaceRepository.findByBusinessId(
      businessOne.id,
    )

    return { placesForBusinessOne }
  })

  const { placesForBusinessOne } = await Effect.runPromise(
    program.pipe(Effect.provide(testLayer)),
  )

  expect(placesForBusinessOne).toHaveLength(2)
  expect(placesForBusinessOne.map((place) => place.name)).toEqual([
    "Cafe Uno",
    "Cafe Dos",
  ])
})

test.skip("update modifies provided fields", async () => {
  const program = Effect.gen(function* () {
    const business = yield* createBusinessUser("update")

    const place = yield* PlaceRepository.create({
      business_id: business.id,
      name: "Old Name",
      description: "Old description",
      // coordinates skipped - PostGIS not available in pglite
      address: "Old Address",
    })

    const updated = yield* PlaceRepository.update(place.id, {
      name: "New Name",
      description: "Updated description",
    })

    return { updated }
  })

  const { updated } = await Effect.runPromise(
    program.pipe(Effect.provide(testLayer)),
  )

  expect(updated.name).toBe("New Name")
  expect(updated.description).toBe("Updated description")
})

test.skip("delete removes a place and returns the deleted record", async () => {
  const program = Effect.gen(function* () {
    const business = yield* createBusinessUser("delete")

    const place = yield* PlaceRepository.create({
      business_id: business.id,
      name: "To Be Deleted",
      description: "Temporary place",
      // coordinates skipped - PostGIS not available in pglite
      address: "Delete Address",
    })

    const deleted = yield* PlaceRepository.delete(place.id)
    const afterDelete = yield* PlaceRepository.findById(place.id)

    return { deleted, afterDelete }
  })

  const { deleted, afterDelete } = await Effect.runPromise(
    program.pipe(Effect.provide(testLayer)),
  )

  expect(deleted).not.toBeNull()
  expect(deleted?.id).toBeDefined()
  expect(afterDelete).toBeNull()
})


