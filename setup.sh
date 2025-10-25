#!/usr/bin/env bash
set -e

# Ruta del proyecto relativa a la ubicación de este script
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
LIEOU_DIR="$ROOT_DIR/Proyecto/lieou"

# Verificar prerequisitos
for cmd in node pnpm docker; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Falta instalar: $cmd"
    exit 1
  fi
done

cd "$LIEOU_DIR"

# Instalar dependencias
pnpm install

# Base de datos
docker compose up -d
sleep 5

# Migraciones
pnpm run db push

echo "✅ Setup completado."



