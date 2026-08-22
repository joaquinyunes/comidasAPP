import Image from "next/image";

// Imagen de producto/ilustración: el tamaño real lo pone el CSS del
// contenedor; acá solo damos un ratio base para que next/image reserve
// espacio y evite el salto de layout.
export function Imagen({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={800}
      className={className}
      style={{ width: "100%", height: "auto" }}
      priority={priority}
      sizes="(max-width: 768px) 90vw, 480px"
    />
  );
}

// Miniatura de tamaño fijo (ítems de la carta).
export function ImagenThumb({
  src,
  alt,
  size = 84,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "cover" }}
    />
  );
}

// Imagen que llena su contenedor con object-fit: cover (galería).
export function ImagenCover({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      style={{ objectFit: "cover" }}
      sizes="(max-width: 768px) 50vw, 33vw"
    />
  );
}
