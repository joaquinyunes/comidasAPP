import SiteChrome from "@/components/landing/site-chrome";

export const metadata = { title: "Aviso de privacidad" };

const SECCIONES = [
  { t: "Qué datos recopilamos", p: "Cuando reservás o hacés un pedido guardamos tu nombre, teléfono y, si lo dejás, tu email. Nada más." },
  { t: "Para qué los usamos", p: "Únicamente para gestionar tu reserva o pedido y contactarte si hace falta. No los usamos para publicidad de terceros." },
  { t: "Con quién los compartimos", p: "No vendemos ni cedemos tus datos. Solo los ve el personal de Cozizina que necesita atender tu solicitud." },
  { t: "Cuánto tiempo los guardamos", p: "Conservamos los datos de reservas y pedidos el tiempo necesario para operar y cumplir obligaciones fiscales, y luego los eliminamos." },
  { t: "Tus derechos", p: "Podés pedir acceso, corrección o eliminación de tus datos escribiendo a nuestro correo de contacto." },
];

export default function PrivacidadPage() {
  return (
    <SiteChrome eyebrow="Privacidad" title={<>Aviso de <span>privacidad</span></>}>
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
