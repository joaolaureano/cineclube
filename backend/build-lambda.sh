#!/bin/bash
# Empacota o backend para a Lambda: codigo compilado + dependencias de
# producao. Zip direto, sem imagem de container - o pacote fica em ~28 MB, bem
# abaixo do limite de 50 MB de upload, e assim nao ha registry a manter.
set -euo pipefail

cd "$(dirname "$0")"

OUT="${1:-dist-lambda}"

rm -rf "$OUT" "$OUT.zip"
mkdir -p "$OUT"

# tsoa gera rotas e swagger; ambos sao pre-requisitos do tsc
npm run tsoa:gen
npx tsc

cp -R dist "$OUT/dist"
cp package.json package-lock.json "$OUT/"

# src/data alimenta o seed e e lido por caminho relativo em runtime
if [ -d src/data ]; then
  mkdir -p "$OUT/src"
  cp -R src/data "$OUT/src/data"
fi

# --omit=dev: tsoa, jest e typescript nao tem o que fazer em runtime e
# sozinhos dobrariam o tamanho do pacote
(cd "$OUT" && npm ci --omit=dev --silent)

(cd "$OUT" && zip -qr "../$OUT.zip" .)

echo "pacote: $OUT.zip ($(du -h "$OUT.zip" | cut -f1))"
