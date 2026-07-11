# 2.4.3 — Reconocimiento por QR / Login

## Descripción
Mecanismo técnico para vincular al cliente con su perfil al sentarse: QR en la mesa o login en la app cliente. Sin app de terceros.

## Dependencias
- Generación de QR por mesa (`Mesa.qrToken`).
- Sesión de cliente en la app (ver 2.8 autogestión).

## Contenido
- Cada mesa tiene un QR que vincula mesa↔cliente para el turno.
- Login de cliente (app o web) asocia su perfil al pedido.
- El vínculo se libera al cerrar la mesa.
- Funciona también en modo invitado (sin perfil).

## Criterio de validación
- Escanear el QR de la mesa vincula la sesión del cliente a la mesa.
- El vínculo se corta al cerrar la cuenta.
- Modo invitado sigue permitiendo pedir sin perfil.
