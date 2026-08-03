"use client";

export default function StatsBlocks() {
  return (
    <div id="stats">
      <section className="stats-block">
        <div className="stats-media reveal">
          <img
            src="https://images.unsplash.com/photo-1595703684213-b9ca504fc2e8?w=800&q=80"
            alt="Horno de leña"
          />
        </div>
        <div className="stats-copy reveal">
          <span className="eyebrow">Nuestro proceso</span>
          <h3>
            Fuego, madera <br />
            <span className="font-accent">y pasion</span>
          </h3>
          <div className="stats-tags">
            <div>Fuegas durante 45 minutos</div>
            <div>Masa fermentada 72 horas</div>
            <div>Ingredientes de temporada</div>
          </div>
        </div>
      </section>

      <section className="stats-block reverse">
        <div className="stats-media reveal">
          <img
            src="https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&q=80"
            alt="Ingredientes frescos"
          />
        </div>
        <div className="stats-copy reveal">
          <span className="eyebrow">Calidad</span>
          <h3>
            Directo de <br />
            <span className="font-accent">la tierra</span>
          </h3>
          <div className="stats-tags">
            <div>Mozzarella importada de Campania</div>
            <div>Tomates San Marzano del Vesubio</div>
            <div>Harina italiana tipo 00</div>
          </div>
        </div>
      </section>
    </div>
  );
}
