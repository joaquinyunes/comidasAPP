// Secreto con el que se firman y verifican las sesiones (JWT).
// En producción es obligatorio y no hay valor por defecto: un fallback
// conocido permitiría falsificar un token de administrador.

const SECRETO_DEV = "tu-secreto-super-seguro-cambiar-en-produccion";
const LARGO_MINIMO = 32;

export function getJwtSecret(): string {
  const secreto = process.env.JWT_SECRET;

  if (process.env.NODE_ENV !== "production") return secreto || SECRETO_DEV;

  if (!secreto || secreto.length < LARGO_MINIMO) {
    throw new Error(
      `JWT_SECRET es obligatorio en producción (mínimo ${LARGO_MINIMO} caracteres).`
    );
  }
  return secreto;
}
