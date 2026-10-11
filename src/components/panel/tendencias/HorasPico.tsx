import Bloque from "../ui/Bloque";

// Desde las 11 hasta las 2 de la madrugada: el horario de un restaurante.
const HORAS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2];

// Cuándo entran más pedidos, para armar turnos y producción.
export default function HorasPico({ pedidosPorHora }: { pedidosPorHora: number[] }) {
  const serie = HORAS.map((h) => ({ hora: h, n: pedidosPorHora[h] ?? 0 }));
  const maximo = Math.max(1, ...serie.map((s) => s.n));
  const total = serie.reduce((s, x) => s + x.n, 0);
  const pico = serie.reduce((m, x) => (x.n > m.n ? x : m), serie[0]);

  return (
    <Bloque titulo="Horas con más pedidos" nota="Últimos 30 días">
      {total === 0 ? (
        <p className="text-sm text-pn-suave">Todavía no hay pedidos para comparar.</p>
      ) : (
        <>
          <div className="flex h-32 items-end gap-1" role="img" aria-label="Pedidos por hora del día">
            {serie.map((s) => (
              <div key={s.hora} className="flex h-full flex-1 flex-col justify-end" title={`${s.hora}:00 · ${s.n} pedidos`}>
                <div
                  className={`w-full rounded-t ${s.hora === pico.hora ? "bg-pn-marca" : "bg-pn-tinta"}`}
                  style={{ height: `${Math.max(2, Math.round((s.n / maximo) * 100))}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex gap-1">
            {serie.map((s) => (
              <span key={s.hora} className="pn-num flex-1 text-center text-[10px] text-pn-suave">
                {s.hora}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-pn-suave">
            La hora fuerte es las <span className="font-medium text-pn-tinta">{pico.hora}:00</span> ({pico.n} pedidos).
          </p>
        </>
      )}
    </Bloque>
  );
}
