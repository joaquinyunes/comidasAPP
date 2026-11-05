#!/usr/bin/env bash
# V7: chequeo de disponibilidad. La portada responde 200 en menos de 10 s y trae un <h1>,
# y /api/salud confirma que la base de datos contesta.
# Uso: scripts/uptime.sh [URL_BASE]   (sale con 1 si algo falla 3 veces seguidas)
base="${1:-https://cozizina.vercel.app}"
base="${base%/}"

chequear() { # $1 = url, $2 = texto que tiene que aparecer
  for intento in 1 2 3; do
    cuerpo=$(curl -sS -L --max-time 10 -w '\n%{http_code} %{time_total}' "$1" 2>&1) || true
    estado=$(printf '%s' "$cuerpo" | tail -n1)
    if [ "${estado%% *}" = "200" ] && printf '%s' "$cuerpo" | grep -q "$2"; then
      echo "OK $1 (${estado#* } s)"
      return 0
    fi
    echo "Intento $intento falló para $1: $estado" >&2
    sleep 10
  done
  echo "CAÍDO: $1" >&2
  return 1
}

fallo=0
chequear "$base/" '<h1' || fallo=1
chequear "$base/api/salud" '"ok":true' || fallo=1
exit $fallo
