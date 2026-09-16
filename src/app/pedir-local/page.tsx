import SiteChrome from "@/components/landing/site-chrome";
import OrdenarLocal from "@/components/ordenar/OrdenarLocal";
import CodigoLocalForm from "@/components/ordenar/CodigoLocalForm";

export default async function PedirLocalPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string }>;
}) {
  const { codigo } = await searchParams;
  const codigoValido = !!codigo && codigo === process.env.NEXT_PUBLIC_QR_LOCAL_CODIGO;

  return (
    <SiteChrome
      eyebrow="En el local"
      title={<>Pedí desde tu <span>mesa</span></>}
      intro="Elegí tus platos y te los llevamos donde estés."
    >
      {codigoValido ? (
        <OrdenarLocal codigoQr={codigo!} />
      ) : (
        <CodigoLocalForm intentoInvalido={!!codigo} />
      )}
    </SiteChrome>
  );
}
