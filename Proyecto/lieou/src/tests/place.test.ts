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

test("creates a place for a business user", async () => {
  const program = Effect.gen(function* () {
    const business = yield* createBusinessUser("create")

    const place = yield* PlaceRepository.create({
      business_id: business.id,
      name: "Test Place",
      description: "Great place for testing",
      location: "https://maps.example.com/test-place",
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

test("findByBusinessId returns only places for the given business", async () => {
  const program = Effect.gen(function* () {
    const businessOne = yield* createBusinessUser("one")
    const businessTwo = yield* createBusinessUser("two")

    yield* PlaceRepository.create({
      business_id: businessOne.id,
      name: "Cafe Uno",
      description: "Coffee spot",
      location: "https://maps.example.com/cafe-uno",
    })

    yield* PlaceRepository.create({
      business_id: businessOne.id,
      name: "Cafe Dos",
      description: "Second coffee spot",
      location: "https://maps.example.com/cafe-dos",
    })

    yield* PlaceRepository.create({
      business_id: businessTwo.id,
      name: "Cafe Tres",
      description: "Another coffee spot",
      location: "https://maps.example.com/cafe-tres",
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

test("update modifies provided fields", async () => {
  const program = Effect.gen(function* () {
    const business = yield* createBusinessUser("update")

    const place = yield* PlaceRepository.create({
      business_id: business.id,
      name: "Old Name",
      description: "Old description",
      location: "https://maps.example.com/old",
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

test("delete removes a place and returns the deleted record", async () => {
  const program = Effect.gen(function* () {
    const business = yield* createBusinessUser("delete")

    const place = yield* PlaceRepository.create({
      business_id: business.id,
      name: "To Be Deleted",
      description: "Temporary place",
      location: "https://maps.example.com/delete",
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
