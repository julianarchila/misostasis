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
  - `index.ts`: fábrica de conexión (`drizzle`) y singleton de DB.
- `src/server/repositories/`
  - `user.ts`: repositorio (mock en memoria) como `Effect.Service`.
- `src/server/services/`
  - `user.ts`: servicio de dominio que usa repositorios y contexto de autenticación.
- `src/server/rpc/`
  - `request.ts`: contratos RPC y grupo (`RpcGroup`) con `Schema`.
  - `middleware.ts`: `AuthMiddleware` y `CurrentUser` (Context).
  - `handler.ts`: implementación “live” de handlers y middleware (Clerk).
- `src/app/rpc/route.ts`: ruta Next.js que expone el servidor RPC.
- `src/lib/effect-query.ts`: cliente RPC como servicio Effect y capa de transporte.
- `src/providers.tsx` y `src/get-query-client.ts`: setup de React Query.
- `src/app/**`: UI (mock), páginas y proveedores.

---

## Patrón por capas

1) Base de datos (Drizzle) → 2) Repositorio → 3) Servicio (dominio) → 4) RPC (transporte) → 5) Cliente (Effect Query/React Query) → 6) UI (React).

### 1) DB: esquema y conexión
Tablas (usuarios, lugares, tags, etc.) en `src/server/db/schema.ts`. Conexión singleton:

```ts
// src/server/db/index.ts
import 'dotenv/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

let instance: NodePgDatabase<typeof schema> | undefined;

export function getDb(): NodePgDatabase<typeof schema> {
  if (!instance) {
    instance = drizzle({
      schema,
      connection: process.env.DATABASE_URL!,
    });
  }
  return instance;
}
```

### 2) Repositorios (acceso a datos)
Los repositorios se modelan como `Effect.Service`, lo que permite:
- Inyección de dependencias (cambiar backend: mock ↔ DB real).
- Composición y pruebas aisladas.

Mock actual en `src/server/repositories/user.ts` usando `Ref<Array<User>>` para simular persistencia (findMany, findById, create).

### 3) Servicios (lógica de dominio)
Los servicios encapsulan reglas de negocio y consumen repositorios. También leen el contexto de usuario actual proporcionado por middleware:

```ts
// src/server/services/user.ts (fragmento)
export class UserService extends Effect.Service<UserService>()(
  "UserService",
  {
    effect: Effect.gen(function* () {
      const userRepo = yield* UserRepository
      return {
        list: () => Effect.gen(function* () {
          const currentUser = yield* CurrentUser
          yield* Effect.log(`Current User: ${currentUser}`)
          return yield* userRepo.findMany
        }),
        byId: (id: string) => userRepo.findById(id),
        create: (name: string) => userRepo.create(name)
      }
    }),
    dependencies: [UserRepository.Default],
    accessors: true
  }
) { }
```

### 4) RPC: contratos y middleware
Los contratos RPC se definen con `Schema` y se agrupan con `RpcGroup`. Se encadenan middlewares (p.ej. autenticación) que proveen contexto:

```ts
// src/server/rpc/request.ts (fragmento)
export class UserRpcs extends RpcGroup.make(
  Rpc.make("UserList", { success: Schema.Array(User) }),
  Rpc.make("UserById", {
    success: User,
    error: Schema.String,
    payload: { id: Schema.String }
  }),
  Rpc.make("UserCreate", {
    success: User,
    payload: { name: Schema.String }
  })
).middleware(AuthMiddleware) { }
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
export const RpcProtocolLive = RpcClient.layerProtocolHttp({ url: "/rpc" })
  .pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]))

export class MyRpcClient extends Effect.Service<MyRpcClient>()(
  'example/MyRpcClient',
  { dependencies: [], scoped: RpcClient.make(UserRpcs) }
) { }

export const LiveLayer = MyRpcClient.Default.pipe(Layer.provideMerge(RpcProtocolLive));
export const eq = createEffectQuery(LiveLayer);
```

Uso desde un componente:

```tsx
// src/app/rpc-query/page.tsx (fragmento)
const listUserOptions = eq.queryOptions({
  queryKey: ["hello"],
  queryFn: () => Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient
    return yield* rpcClient.UserList()
  })
})
// ...
const { data, isLoading } = useQuery(listUserOptions)
```

El proveedor de React Query está configurado en `src/providers.tsx` y envuelto en `app/layout.tsx`.

---

## Flujo end-to-end de una petición
1. La UI dispara `useQuery` con un `queryFn` que ejecuta un programa `Effect`.
2. `effect-query` provee el `Layer` y resuelve `MyRpcClient`.
3. El cliente realiza un POST a `/rpc` (NDJSON).
4. En el servidor, la ruta `/rpc` ejecuta el `RpcServer` con capas: handlers, auth, serialización y contexto.
5. `AuthMiddleware` inyecta `CurrentUser` en el contexto de Effect.
6. El handler llama al `UserService`, que usa el `UserRepository`.
7. Se resuelve la operación (mock o DB real) y se retorna el resultado tipado.
8. React Query actualiza caché y estado en la UI.

---

## Convenciones
- Definir todas las dependencias en `Effect.Service` + `Layer` (no instanciar manualmente en código de negocio).
- Mantener contratos RPC como la frontera pública del backend (Schemas estrictos).
- Servicios encapsulan lógica; repositorios encapsulan persistencia.
- Middlewares proporcionan contexto (p.ej. usuario actual).