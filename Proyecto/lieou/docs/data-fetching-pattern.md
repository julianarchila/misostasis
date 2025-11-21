## Patrón de Data Fetching para Queries

Este documento describe el patrón recomendado para obtener y mostrar datos en componentes.

### Descripción del Patrón

**Usa una estructura simple de 2 partes:**

1. **Componente de Presentación** (`XxxUI.tsx`) - Renderiza solo el estado de éxito
2. **Componente Page/Container** (`page.tsx`) - Maneja loading, errores, y renderiza la UI

### ¿Por Qué Este Patrón?

- **Simple**: Sin capas de abstracción innecesarias
- **Type-safe**: `error.match()` infiere automáticamente todos los tipos de error del RPC
- **Separación de responsabilidades**: La lógica de loading/error se queda en el container, el componente UI se enfoca en la presentación
- **Reusable**: El componente UI puede usarse en Storybook, tests, o con datos mock
- **Directo**: Llama a `useQuery` directamente en el container - no necesitas un wrapper de hook personalizado

### Cuándo Crear un Hook Personalizado

Solo crea un hook personalizado (`useXxx.ts`) si necesitas:
- **Lógica adicional** más allá de solo llamar `useQuery` (ej. transformaciones, estado derivado)
- **Múltiples queries/mutations** combinadas juntas
- **Manejo de estado local** (ej. favoritos, selecciones)
- **Lógica de formulario compleja** con mutations (ej. validación, flujos multi-paso)
- **Reusar entre múltiples componentes** con comportamiento compartido

**Ejemplos de hooks para MANTENER:**
- ✅ `useCreatePlaceForm` - Tiene lógica de formulario, validación, manejo de mutations, side effects
- ✅ `useOnboardingForm` - Formulario complejo multi-paso con manejo de estado
- ✅ `usePlaceFavorite` - Manejo de estado local para interacciones de UI
- ✅ `useSavedPlacesFavorites` - Manejo de estado local con posibles mutations

**Ejemplos de hooks para ELIMINAR:**
- ❌ `useMyPlaces` - Solo envuelve `useQuery(getMyPlacesOptions)` sin lógica adicional
- ❌ `usePlace(id)` - Solo envuelve `useQuery(getPlaceByIdOptions(id))` sin lógica adicional

**Regla de oro:** Si tu hook es solo `return useQuery(...)` o `return useMutation(...)` sin lógica extra, ¡elimínalo y llama al hook directamente en el componente!

---

## Ejemplo de Implementación

### 1. Componente de Presentación (`PlaceDetailUI.tsx`)

Toma los datos y los renderiza. **Solo maneja el estado de éxito:**

```typescript
import type { Place } from "@/server/schemas/place";

interface PlaceDetailUIProps {
  place: Place; // Not Place | undefined - we only render on success!
}

export function PlaceDetailUI({ place }: PlaceDetailUIProps) {
  return (
    <div>
      <h1>{place.name}</h1>
      <p>{place.description}</p>
      {/* ... rest of UI ... */}
    </div>
  );
}
```

**Propósito:** Componente de presentación puro que es fácil de testear y reusar.

---

### 2. Componente Page/Container (`page.tsx`)

Maneja todos los estados: loading, error (con `error.match()`), y success:

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPlaceByIdOptions } from "@/data-access/places";
import { PlaceDetailUI } from "./-components/PlaceDetailUI";

export default function PlaceDetailPage({ params }) {
  const router = useRouter();
  const placeId = parseInt(params.id, 10);
  
  // Call useQuery directly - no need for a custom hook wrapper
  const { data: place, isLoading, error } = useQuery(getPlaceByIdOptions(placeId));

  // 1. Handle loading
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // 2. Handle errors with type-safe error.match()
  if (error) {
    let errorMessage = "An unexpected error occurred";
    let errorTitle = "Error";

    // error.match() automatically infers error types from RPC definition
    error.match({
      Unauthenticated: () => {
        errorTitle = "Authentication Required";
        errorMessage = "You must be logged in.";
      },
      PlaceNotFound: () => {
        errorTitle = "Not Found";
        errorMessage = "This place doesn't exist.";
      },
      OrElse: () => {
        errorTitle = "Error";
        errorMessage = "Something went wrong.";
      },
    });

    return (
      <div className="text-center py-8">
        <h2>{errorTitle}</h2>
        <p>{errorMessage}</p>
        <Button onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  // 3. TypeScript narrowing check (needed for type safety)
  if (!place) {
    return null; // Won't execute at runtime
  }

  // 4. Render success state
  return <PlaceDetailUI place={place} />;
}
```

**Propósito:** Orquesta todos los estados y delega el renderizado al componente UI.

---

## Puntos Clave

### ✅ Haz

- **Mantén el manejo de errores en el page/container** - `error.match()` proporciona inferencia automática de tipos
- **Haz que los componentes UI requieran datos non-null** - solo se renderizan en éxito
- **Llama a `useQuery` directamente** - no necesitas wrappers de hooks personalizados para casos simples
- **Maneja los tres estados**: loading, error, success

### ❌ No Hagas

- **No pases el error a componentes UI** - perderás type safety con `error.match()`
- **No intentes tipar el error manualmente** - es complejo y rompe la inferencia
- **No omitas el TypeScript narrowing check** (`if (!place) return null`) - TypeScript lo necesita
- **No crees hooks personalizados para llamadas `useQuery` de una línea** - eso es abstracción innecesaria

---

## Para Mutations (Formularios, Acciones)

Las mutations usan un patrón diferente - maneja errores en el hook de mutation con `onError`:

```typescript
// useCreatePlaceForm.ts
export function useCreatePlaceForm() {
  const { mutate, isPending } = useMutation({
    ...createPlaceOptions,
    onError: (error) => {
      error.match({
        Unauthenticated: () => {
          toast.error("You must be logged in");
        },
        UploadError: (e) => {
          toast.error(`Upload failed: ${e.fileName}`);
        },
        OrElse: () => {
          toast.error("Something went wrong");
        },
      });
    },
    onSuccess: () => {
      toast.success("Created!");
    },
  });

  // ... form logic
}
```

---

## Resumen

**Patrón en 2 archivos:**

1. `XxxUI.tsx` - Componente que renderiza el estado de éxito (toma datos non-null)
2. `page.tsx` - Container que maneja loading/error/success con llamada directa a `useQuery`

**Archivo opcional 3:**
- `useXxx.ts` - Solo crea si necesitas lógica compleja, no para wrappers simples de `useQuery`

Esto mantiene las cosas simples, evita abstracción innecesaria, mantiene type safety completo, y sigue las mejores prácticas de React.
