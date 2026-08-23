import SiteChrome from "@/components/landing/site-chrome";

export const metadata = { title: "Términos y condiciones" };

const SECCIONES = [
  { t: "General", p: "Al usar el sitio de Cozizina o nuestros servicios aceptás estos términos. Podemos actualizarlos en cualquier momento; la versión vigente es la publicada en esta página." },
  { t: "Reservas", p: "La mesa se mantiene hasta 15 minutos después de la hora reservada. Pasado ese tiempo puede liberarse. Podés cancelar sin costo hasta 2 horas antes." },
  { t: "Pedidos y pagos", p: "Los pedidos se confirman al momento de realizarlos. Aceptamos tarjetas, transferencia y efectivo. Los precios están en pesos mexicanos e incluyen impuestos." },
  { t: "Envíos", p: "El reparto propio cubre la zona de cada sucursal. Los tiempos son estimados y pueden variar según demanda y clima." },
  { t: "Alérgenos", p: "Indicamos los alérgenos principales de cada plato, pero trabajamos con ingredientes compartidos. Si tenés una alergia grave, avisanos antes de pedir." },
  { t: "Responsabilidad", p: "Cozizina no se responsabiliza por objetos personales olvidados en el local." },
];

export default function TerminosPage() {
  return (
    <SiteChrome eyebrow="Legal" title={<>Términos y <span>condiciones</span></>}>
      <div className="prose-pop">
        {SECCIONES.map((s) => (
          <div key={s.t}>
            <h2>{s.t}</h2>
            <p>{s.p}</p>
          </div>
        ))}
        <p className="form-note">Última actualización: enero 2026.</p>
      </div>
    </SiteChrome>
  );
}
