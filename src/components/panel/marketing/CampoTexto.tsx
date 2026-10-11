import { useId, type InputHTMLAttributes } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  etiqueta: string;
  ayuda?: string;
}

// Campo de formulario con su etiqueta enlazada (lectores de pantalla y toque fácil).
export default function CampoTexto({ etiqueta, ayuda, className, ...resto }: Props) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {etiqueta}
      </label>
      <input
        id={id}
        aria-describedby={ayuda ? `${id}-ayuda` : undefined}
        className="min-h-11 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel px-3 text-base"
        {...resto}
      />
      {ayuda && (
        <p id={`${id}-ayuda`} className="mt-1 text-xs text-pn-suave">
          {ayuda}
        </p>
      )}
    </div>
  );
}
