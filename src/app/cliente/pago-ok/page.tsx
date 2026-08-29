export const metadata = { title: "Pago recibido" };

export default function PagoOkPage() {
  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <div className="text-5xl">✅</div>
      <h1 className="mt-3 text-2xl font-bold">¡Gracias!</h1>
      <p className="mt-2 text-zinc-600">
        Estamos confirmando tu pago. Si ya lo aprobaste, tu mesa quedó saldada.
      </p>
    </div>
  );
}
