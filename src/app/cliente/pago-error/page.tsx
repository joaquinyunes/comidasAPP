export const metadata = { title: "Pago no completado" };

export default function PagoErrorPage() {
  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <div className="text-5xl">⚠️</div>
      <h1 className="mt-3 text-2xl font-bold">No se completó el pago</h1>
      <p className="mt-2 text-zinc-600">
        Podés volver a intentar desde tu celular o avisarle al mozo para pagar en la mesa.
      </p>
    </div>
  );
}
