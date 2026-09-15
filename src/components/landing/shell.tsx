"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "./navbar";
import Hero from "./hero";
import Marquee from "./marquee";
import FeaturedProducts from "./featured-products";
import Ingredients from "./ingredients";
import Story from "./story";
import GalaxySlider from "./galaxy-slider";
import Gallery from "./gallery";
import Specials from "./specials";
import Testimonials from "./testimonials";
import FAQ from "./faq";
import WhereToFind from "./where-to-find";
import FinalCTA from "./cta";
import FloatingShapes from "./floating-shapes";
import Footer from "./footer";
import { useScrollReveal } from "./animations/use-scroll-reveal";
import { useMagneticButtons } from "./animations/use-magnetic";

export default function LandingShell() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const rescanReveals = useScrollReveal();
  const rescanMagnetic = useMagneticButtons(rootRef);

  const handleStart = useCallback(() => {
    setCollapsing(true);
    setTimeout(() => setPreloaderDone(true), 900);
  }, []);

  // Auto-cierre del preloader (accesibilidad + si no hay interacción).
  useEffect(() => {
    const t = setTimeout(handleStart, 2200);
    return () => clearTimeout(t);
  }, [handleStart]);

  // Datos async (carta destacada) montan tarjetas nuevas después del primer
  // paso de GSAP: se re-escanean para engancharlas al reveal por scroll.
  useEffect(() => {
    if (!preloaderDone) return;
    const rescanAll = () => {
      rescanReveals();
      rescanMagnetic();
    };
    const t = setTimeout(rescanAll, 100);
    const mut = new MutationObserver(rescanAll);
    mut.observe(document.body, { childList: true, subtree: true });
    return () => {
      clearTimeout(t);
      mut.disconnect();
    };
  }, [preloaderDone, rescanReveals, rescanMagnetic]);

  return (
    <div ref={rootRef}>
      {!preloaderDone && (
        <div id="preloader" className={collapsing ? "collapsing" : ""}>
          <div className="preloader-logo">COZIZINA</div>
          <div className="preloader-sub">Comida al estilo cósmico</div>
          <button className="preloader-start" onClick={handleStart}>
            Entrar
          </button>
        </div>
      )}

      <FloatingShapes />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <FeaturedProducts />
        <Ingredients />
        <Story />
        <GalaxySlider />
        <Gallery />
        <Specials />
        <Testimonials />
        <FAQ />
        <WhereToFind />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
