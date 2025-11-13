## Arquitectura y patrones del proyecto

Este documento resume la arquitectura, los patrones y el flujo de datos del proyecto. El objetivo es facilitar el desarrollo consistente, predecible y con alta seguridad de tipos usando Effect, RPC tipado, y una capa de servicios y repositorios clara.

### Tecnologías clave
- **Effect (effect)**: composición funcional, control de efectos, DI con `Layer`/`Context`, servicios tipados.
- **@effect/rpc**: contratos RPC tipados con `Schema`, transporte HTTP y serialización NDJSON.
- **Drizzle ORM**: modelado de esquema y acceso a base de datos PostgreSQL.
- **React Query + effect-query**: puente para ejecutar programas `Effect` desde componentes React con caché, estados y reintentos.
- **Clerk**: autenticación y middleware en Next.js.
- **Next.js App Router**: exposición de la ruta `/rpc` y UI cliente.

---

## Estructura de carpetas

- `src/server/db/`
  - `schema.ts`: tablas y relaciones (Drizzle).
  - `service.ts`: servicio `DB` con inyección de dependencias y soporte para NodePg/Pglite.
- `src/server/repositories/`
  - `user.ts`, `place.ts`: repositorios como `Effect.Service`.
- `src/server/services/`
  - `user.ts`, `place.ts`: servicios de dominio que usan repositorios y contexto de autenticación.
- `src/server/schemas/`
  - `user.ts`, `place.ts`, `error.ts`, `auth.ts`: esquemas y tipos compartidos.
- `src/server/utils/`
  - `auth.ts`: utilidades de autenticación compartidas (`authRequired`, `getClerkUserById`, `setPublicMetadata`).
- `src/server/rpc/`
  - `groups/`: definiciones de RPC por dominio
    - `user.rpcs.ts`: contratos RPC de usuario con `Schema`.
    - `place.rpcs.ts`: contratos RPC de lugares con `Schema`.
    - `index.ts`: exporta `AppRpcs` (combinación de todos los grupos).
  - `handlers/`: implementaciones de handlers por dominio
    - `user.handler.ts`: implementación "live" de handlers de usuario.
    - `place.handler.ts`: implementación "live" de handlers de lugares.
    - `index.ts`: exporta `HandlersLive` (combinación de todos los handlers).
  - `middlewares/`: middlewares RPC
    - `auth.middleware.ts`: `AuthMiddleware`, `AuthSession` y `AuthMiddlewareLive`.
    - `index.ts`: exporta todos los middlewares.
  - `server.ts`: configuración del servidor RPC (combina capas y exporta handler).
- `src/app/rpc/route.ts`: ruta Next.js que expone el servidor RPC (wrapper mínimo).
- `src/lib/effect-query.ts`: cliente RPC como servicio Effect y capa de transporte.
- `src/data-access/`: opciones de queries/mutations para React Query.
- `src/providers.tsx` y `src/get-query-client.ts`: setup de React Query.
- `src/app/**`: UI, páginas y proveedores.

---

## Patrón por capas

1) Base de datos (Drizzle) → 2) Repositorio → 3) Servicio (dominio) → 4) RPC (transporte) → 5) Cliente (Effect Query/React Query) → 6) UI (React).

### 1) DB: esquema y conexión
Tablas (usuarios, lugares, tags, etc.) en `src/server/db/schema.ts`. La base de datos se gestiona mediante un servicio Effect (`DB`) que permite inyección de dependencias y facilita el cambio entre PostgreSQL (NodePg) e in-memory (Pglite) para testing:

```ts
// src/server/db/service.ts
import { Effect, type Layer } from "effect"
import { drizzle as drizzle_pg, type NodePgClient } from "drizzle-orm/node-postgres"
import type { drizzle as drizzle_pglite } from "drizzle-orm/pglite"
import * as dbSchema from "./schema"
import { DatabaseError } from "@/server/schemas/error"

type TDBClient = LiveDBClient | TestDBClient

export class DB extends Effect.Service<DB>()("DB", {
  sync: () => {
    if (!dbClient) {
      dbClient = drizzle_pg({
        schema: dbSchema,
        connection: process.env.DATABASE_URL!,
      })
    }
    const DBQuery = makeQueryHelper(dbClient)
    return { client: dbClient, DBQuery }
  },
}) { }

export const makeQueryHelper = (client: TDBClient) => {
  return <R>(cb: DBQueryCb<R>) =>
    Effect.gen(function* () {
      const res = yield* Effect.tryPromise({
        try: () => cb(client),
        catch: (err) => new DatabaseError({ cause: err, message: "Database query failed :(" }),
      }).pipe(
        Effect.catchTags({
          DatabaseError: Effect.die
        }),
      )
      return res
    })
}
```

El servicio:
- Mantiene un singleton del cliente DB (NodePg o Pglite).
- Proporciona `DBQuery` para ejecutar consultas con manejo de errores tipado.
- Permite inyección de dependencias: usar `DB.Default` en producción o un `Layer` alternativo en tests con Pglite.
- Es accesible desde cualquier servicio/repositorio mediante `yield* DB`.

### 2) Repositorios (acceso a datos)
Los repositorios se modelan como `Effect.Service` y consumen el servicio `DB` para acceder a datos:
- Inyección de dependencias (cambiar backend: mock ↔ DB real, PostgreSQL ↔ Pglite).
- Composición y pruebas aisladas.
- Acceso a datos con manejo de errores tipado a través de `DBQuery`.

Ejemplo en `src/server/repositories/user.ts`:

```ts
export class UserRepository extends Effect.Service<UserRepository>()(
  "UserRepository",
  {
    effect: Effect.gen(function* () {
      const { DBQuery } = yield* DB

      return {
        create: (payload: { 
          clerk_id: string; 
          email: string; 
          fullName: string; 
          role: string 
        }) =>
          Effect.gen(function* () {
            return yield* DBQuery((db) =>
              db.insert(userTable).values({ ...payload }).returning()
            ).pipe(
              Effect.flatMap(EArray.head),
              Effect.catchTags({
                NoSuchElementException: () => Effect.die("Failed to create user"),
              }),
            )
          }),
      }
    }),
    dependencies: [DB.Default],
    accessors: true
  }
) { }
```

### 3) Servicios (lógica de dominio)
Los servicios encapsulan reglas de negocio y consumen repositorios. Utilizan utilidades de autenticación compartidas de `src/server/utils/auth.ts`:

```ts
// src/server/services/user.ts (fragmento)
import { authRequired, getClerkUserById, setPublicMetadata } from "@/server/utils/auth"

export class UserService extends Effect.Service<UserService>()(
  "UserService",
  {
    effect: Effect.gen(function* () {
      const userRepo = yield* UserRepository

      return {
        onboard: (payload: OnboardUserPayload) => Effect.gen(function* () {
          const currentUser = yield* authRequired
          const clerkUser = yield* getClerkUserById(currentUser.user.id).pipe(Effect.orDie)

          yield* userRepo.create({
            clerk_id: currentUser.user.id,
            email: clerkUser.primaryEmailAddress!.emailAddress,
            fullName: payload.fullName,
            role: payload.userType
          }).pipe(Effect.orDie)

          yield* setPublicMetadata(currentUser.user.id, {
            onboardingComplete: true,
            role: payload.userType
          }).pipe(Effect.orDie)
        })
      }
    }),
    dependencies: [UserRepository.Default],
    accessors: true
  }
) { }
```

**Utilidades compartidas de autenticación** (`src/server/utils/auth.ts`):
- `authRequired`: verifica que el usuario esté autenticado (falla con `Unauthenticated` si no lo está).
- `getClerkUserById`: obtiene un usuario de Clerk por ID.
- `setPublicMetadata`: actualiza los metadatos públicos de un usuario en Clerk.

Estas utilidades son reutilizables en todos los servicios que requieran autenticación, evitando duplicación de código.

### 4) RPC: contratos, handlers y middleware

#### Organización por dominios
La capa RPC está organizada en tres subcarpetas para facilitar la escalabilidad:

**`groups/`** - Definiciones de contratos RPC por dominio:
```ts
// src/server/rpc/groups/user.rpcs.ts
import { Rpc, RpcGroup } from "@effect/rpc"
import { AuthMiddleware } from "@/server/rpc/middlewares"
import { OnboardUserPayload } from "@/server/schemas/user"
import { Unauthenticated } from "@/server/schemas/error"

export class UserRpcs extends RpcGroup.make(
  Rpc.make("Onboard", {
    payload: OnboardUserPayload,
    error: Unauthenticated
  })
).prefix("User").middleware(AuthMiddleware) { }
```

```ts
// src/server/rpc/groups/index.ts
import { UserRpcs } from "./user.rpcs"
import { PlaceRpcs } from "./place.rpcs"

export const AppRpcs = UserRpcs.merge(PlaceRpcs)
export { UserRpcs, PlaceRpcs }
```

**`middlewares/`** - Definiciones e implementaciones de middlewares:
```ts
// src/server/rpc/middlewares/auth.middleware.ts
import { RpcMiddleware } from "@effect/rpc"
import { Context, Effect, Layer } from "effect"
import type { Session } from "@/server/schemas/auth"
import { auth } from '@clerk/nextjs/server'
import { User } from "@/server/schemas/user"

export class AuthSession extends Context.Tag("CurrentUser")<
  AuthSession,
  Session | null
>() { }

export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()(
  "AuthMiddleware",
  {
    provides: AuthSession,
  }
) { }

export const AuthMiddlewareLive: Layer.Layer<AuthMiddleware> = Layer.succeed(
  AuthMiddleware,
  AuthMiddleware.of(() => Effect.gen(function* () {
    const r = yield* Effect.promise(async () => await auth())

    return yield* Effect.if(r.isAuthenticated, {
      onTrue: () => Effect.succeed({
        user: new User({ id: r.userId!, name: "kasdf" }),
        raw: r
      }),
      onFalse: () => Effect.succeed(null)
    })
  }))
)
```

**`handlers/`** - Implementaciones de handlers por dominio:
```ts
// src/server/rpc/handlers/user.handler.ts
import { Effect, Layer } from "effect"
import { UserRpcs } from "@/server/rpc/groups/user.rpcs"
import { UserService } from "@/server/services/user"

export const UserHandlersLive = UserRpcs.toLayer(
  Effect.gen(function* () {
    const userService = yield* UserService

    return {
      UserOnboard: (payload) => userService.onboard(payload)
    }
  })
).pipe(Layer.provide(UserService.Default))
```

```ts
// src/server/rpc/handlers/index.ts
import { Layer } from "effect"
import { UserHandlersLive } from "./user.handler"
import { PlaceHandlersLive } from "./place.handler"

export const HandlersLive = Layer.mergeAll(
  UserHandlersLive,
  PlaceHandlersLive
)
```

**`server.ts`** - Configuración del servidor RPC:
```ts
// src/server/rpc/server.ts
import { HttpServer } from "@effect/platform"
import { RpcSerialization, RpcServer } from "@effect/rpc"
import { Layer, Logger } from "effect"
import { AppRpcs } from "@/server/rpc/groups"
import { HandlersLive } from "@/server/rpc/handlers"
import { AuthMiddlewareLive } from "@/server/rpc/middlewares"

const serverLayer = Layer.mergeAll(
  HandlersLive,
  AuthMiddlewareLive,
  RpcSerialization.layerNdjson,
  HttpServer.layerContext,
  Logger.pretty
)

export const { handler } = RpcServer.toWebHandler(AppRpcs, {
  layer: serverLayer
})
```

**Ruta Next.js** (wrapper mínimo):
```ts
// src/app/rpc/route.ts
import { handler } from "@/server/rpc/server"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  return handler(request)
}
```

Middleware y capa “live” de auth usando Clerk:

```ts
// src/server/rpc/middleware.ts (esqueleto)
export class CurrentUser extends Context.Tag("CurrentUser")<CurrentUser, User>() {}
export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()(
  "AuthMiddleware",
  { provides: CurrentUser }
) {}
```

```ts
// src/server/rpc/handler.ts 
export const AuthLive: Layer.Layer<AuthMiddleware> = Layer.succeed(
  AuthMiddleware,
  AuthMiddleware.of(() => Effect.gen(function* () {
    const r = yield* Effect.promise(async () => await auth())
    return yield* Effect.if(r.isAuthenticated, {
      onTrue: () => Effect.succeed(new User({ id: r.userId!, name: "Unknown" })),
      onFalse: () => Effect.succeed(new User({ id: "123", name: "Guest" }))
    })
  }))
)
```

Handlers que conectan RPC ↔ Servicio:

```ts
// src/server/rpc/handler.ts (fragmento)
export const UsersLive = UserRpcs.toLayer(
  Effect.gen(function* () {
    const userService = yield* UserService
    return {
      UserList: () => userService.list(),
      UserById: ({ id }) => userService.byId(id),
      UserCreate: ({ name }) => userService.create(name)
    }
  })
).pipe(Layer.provide(UserService.Default))
```

Ruta Next.js que expone el servidor:

```ts
// src/app/rpc/route.ts
const { handler } = RpcServer.toWebHandler(UserRpcs, {
  layer: Layer.mergeAll(
    UsersLive,
    AuthLive,
    RpcSerialization.layerNdjson,
    HttpServer.layerContext
  )
})
export const POST = handler
```

### 5) Cliente: Effect Query + React Query

```ts
// src/lib/effect-query.ts (fragmento)
import { AppRpcs } from "@/server/rpc/groups"

export const RpcProtocolLive = RpcClient.layerProtocolHttp({ url: "/rpc" })
  .pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]))

export class MyRpcClient extends Effect.Service<MyRpcClient>()(
  'example/MyRpcClient',
  { dependencies: [], scoped: RpcClient.make(AppRpcs) }
) { }

export const LiveLayer = MyRpcClient.Default.pipe(Layer.provideMerge(RpcProtocolLive));
export const eq = createEffectQuery(LiveLayer);
```

Uso desde `data-access` y componentes:

```tsx
// src/data-access/users.ts
export const onboardUserOptions = eq.mutationOptions({
  mutationFn: (payload: OnboardUserPayload) => Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient
    return yield* rpcClient.UserOnboard(payload)
  })
})
```

```tsx
// Componente React
import { onboardUserOptions } from "@/data-access/users"

const { mutate } = useMutation(onboardUserOptions)
mutate({ fullName: "John Doe", userType: "explorer" })
```

El proveedor de React Query está configurado en `src/providers.tsx` y envuelto en `app/layout.tsx`.

---

## Flujo end-to-end de una petición
1. La UI dispara `useMutation` (o `useQuery`) con opciones definidas en `data-access/`.
2. `effect-query` provee el `Layer` y resuelve `MyRpcClient`.
3. El cliente realiza un POST a `/rpc` (NDJSON).
4. En el servidor, la ruta `/rpc` delega al handler configurado en `src/server/rpc/server.ts`.
5. El servidor RPC ejecuta con capas combinadas: handlers, middleware de auth, serialización y contexto HTTP.
6. `AuthMiddleware` inyecta `AuthSession` en el contexto de Effect.
7. El handler correspondiente (ej. `UserHandlersLive`) llama al servicio de dominio (`UserService`).
8. El servicio usa utilidades de `src/server/utils/auth.ts` (como `authRequired`) y llama al repositorio.
9. El repositorio accede a la base de datos mediante el servicio `DB`.
10. Se resuelve la operación y se retorna el resultado tipado.
11. React Query actualiza caché y estado en la UI.

---

## Convenciones
- Definir todas las dependencias en `Effect.Service` + `Layer` (no instanciar manualmente en código de negocio).
- Mantener contratos RPC como la frontera pública del backend (Schemas estrictos).
- Servicios encapsulan lógica; repositorios encapsulan persistencia.
- Middlewares proporcionan contexto (ej. `AuthSession`).
- **DB Service es el punto único de acceso a la base de datos**: todos los repositorios deben consumir `DB` inyectando `dependencies: [DB.Default]`.
- **Utilidades compartidas**: funciones reutilizables (como autenticación) viven en `src/server/utils/`.
- **Organización por dominio en RPC**: cada dominio tiene su archivo en `groups/`, `handlers/` y potencialmente sus propios middlewares.
- **Para testing**: crear un `Layer` alternativo con Pglite (in-memory DB) y proporcionarlo en lugar de `DB.Default` al ejecutar tests.

### Cómo agregar un nuevo grupo RPC
1. Crear `src/server/rpc/groups/my-domain.rpcs.ts` con las definiciones RPC.
2. Crear `src/server/rpc/handlers/my-domain.handler.ts` con la implementación.
3. Exportar el nuevo grupo desde `src/server/rpc/groups/index.ts` (merge con `AppRpcs`).
4. Exportar el nuevo handler desde `src/server/rpc/handlers/index.ts` (merge en `HandlersLive`).
5. El servidor automáticamente incluirá las nuevas operaciones.

Ejemplo de Layer para testing (pseudo-código):

```ts
// tests/db-test-layer.ts
export const DBTestLayer = Layer.succeed(
  DB,
  DB.of(() => {
    const pgliteClient = new Pglite({ schema: dbSchema })
    return { client: pgliteClient, DBQuery: makeQueryHelper(pgliteClient) }
  })
)
```